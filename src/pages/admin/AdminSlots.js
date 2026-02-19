// src/pages/admin/AdminSlots.js
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdClose, MdLocalParking, MdSearch, MdBlock, MdCheckCircle } from 'react-icons/md';
import { slotAPI } from '../../services/api';
import {
  PageWrapper, PageHeader, Title, Text, Card, Badge, Button,
  Flex, Grid, Input, Select, InputGroup, Label, EmptyState,
  Spinner, ModalBackdrop, ModalSheet
} from '../../components/common/UI';
import Layout from '../../components/common/Layout';

const pulse = keyframes`0%,100%{opacity:1;}50%{opacity:0.6;}`;

const SlotCard = styled(motion.div).withConfig({ shouldForwardProp: p => !["cat"].includes(p) })`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ cat }) => cat==='manager'?'rgba(168,85,247,0.25)':'rgba(59,130,246,0.15)'};
  border-radius: 12px;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;

  .top {
    padding: 12px 14px 10px;
    background: ${({ cat }) => cat==='manager'?'rgba(168,85,247,0.06)':'rgba(59,130,246,0.04)'};
    border-bottom: 1px solid ${({ cat }) => cat==='manager'?'rgba(168,85,247,0.1)':'rgba(59,130,246,0.08)'};
    position: relative;
  }
  .slot-num {
    font-family: 'Orbitron',sans-serif;
    font-size: 1.1rem; font-weight: 800;
    color: ${({ cat }) => cat==='manager'?'#a855f7':'#3b82f6'};
    margin-bottom: 6px;
  }
  .type-icon { position:absolute; right:10px; top:10px; font-size:1.4rem; opacity:0.15; }
  .bottom { padding: 10px 14px; }
`;

const StatusDot = styled.div.withConfig({ shouldForwardProp: p => p !== "active" })`
  width: 8px; height: 8px; border-radius: 50%;
  background: ${({ active }) => active ? '#10b981' : '#ef4444'};
  box-shadow: 0 0 6px ${({ active }) => active ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.4)'};
  flex-shrink: 0;
  ${({ active }) => active && `animation: ${pulse} 2s ease-in-out infinite;`}
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 18px;

  @media (max-width: 600px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 380px) { grid-template-columns: repeat(2, 1fr); }
`;

const StatChip = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 10px 12px;
  .val { font-family:'Orbitron',sans-serif; font-size:1.3rem; font-weight:700; color:${({ color }) => color||'#3b82f6'}; line-height:1; }
  .lbl { font-size:9px; color:#475569; text-transform:uppercase; letter-spacing:0.08em; margin-top:3px; }
  @media (max-width: 480px) { .val { font-size:1.1rem; } padding: 8px 10px; }
`;

const FilterRow = styled(Card)`
  padding: 12px 14px;
  margin-bottom: 14px;

  > div {
    display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-end;
    > * { flex: 1 1 120px; min-width: 0; }
    @media (max-width: 480px) {
      > * { flex: 1 1 calc(50% - 4px); }
      > button { flex: 1 1 100%; }
    }
  }
`;

const emptyForm = { slotNumber:'', slotType:'four-wheeler', category:'general', floor:'G', status:'available' };
const container = { hidden:{ opacity:0 }, show:{ opacity:1, transition:{ staggerChildren:0.04 } } };
const cardAnim = { hidden:{ opacity:0, y:14 }, show:{ opacity:1, y:0 } };

export default function AdminSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => { fetchSlots(); }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await slotAPI.getAll();
      const data = res?.data?.data;
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchSlots error:', err);
      toast.error('Failed to load slots');
      setSlots([]);
    } finally { setLoading(false); }
  };

  const openCreate = () => { setForm(emptyForm); setSelectedSlot(null); setModal('create'); };
  const openEdit = (slot) => {
    setSelectedSlot(slot);
    setForm({ slotNumber:slot.slotNumber, slotType:slot.slotType, category:slot.category, floor:slot.floor||'G', status:slot.status });
    setModal('edit');
  };
  const openDelete = (slot) => { setSelectedSlot(slot); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelectedSlot(null); setForm(emptyForm); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal==='create') { await slotAPI.create(form); toast.success(`✅ Slot ${form.slotNumber} created!`); }
      else { await slotAPI.update(selectedSlot._id, form); toast.success(`✅ Slot updated!`); }
      closeModal(); fetchSlots();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await slotAPI.delete(selectedSlot._id);
      toast.success(`Slot ${selectedSlot.slotNumber} deactivated.`);
      closeModal(); fetchSlots();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (slot) => {
    try {
      const newStatus = slot.status==='available'?'inactive':'available';
      await slotAPI.update(slot._id, { status:newStatus, isActive:newStatus!=='inactive' });
      toast.success(`Slot ${slot.slotNumber} ${newStatus==='available'?'activated':'deactivated'}`);
      fetchSlots();
    } catch { toast.error('Failed'); }
  };

  const filtered = slots.filter(s => {
    if (!s || !s._id) return false;
    const num = (s.slotNumber || '').toLowerCase();
    if (search && !num.includes(search.toLowerCase())) return false;
    if (filterCat && (s.category || '') !== filterCat) return false;
    if (filterType && (s.slotType || '') !== filterType) return false;
    return true;
  });

  const total = slots.length;
  const available = slots.filter(s => (s?.status || '') === 'available').length;
  const mgr = slots.filter(s => (s?.category || '') === 'manager').length;
  const tw = slots.filter(s => (s?.slotType || '') === 'two-wheeler').length;
  const inactive = slots.filter(s => s?.isActive === false || (s?.status || '') === 'inactive').length;

  return (
    <Layout>
      <PageWrapper initial={{ opacity:0 }} animate={{ opacity:1 }}>
        <PageHeader>
          <div>
            <Title size="1.6rem">Slot Management</Title>
            <Text muted size="13px" style={{ marginTop:3 }}>Create and manage parking slots</Text>
          </div>
          <Button onClick={openCreate}><MdAdd /> Add Slot</Button>
        </PageHeader>

        <StatsRow>
          <StatChip color="#3b82f6"><div className="val">{total}</div><div className="lbl">Total</div></StatChip>
          <StatChip color="#10b981"><div className="val">{available}</div><div className="lbl">Free</div></StatChip>
          <StatChip color="#a855f7"><div className="val">{mgr}</div><div className="lbl">Manager</div></StatChip>
          <StatChip color="#f59e0b"><div className="val">{tw}</div><div className="lbl">2-Wheeler</div></StatChip>
          <StatChip color="#ef4444"><div className="val">{inactive}</div><div className="lbl">Inactive</div></StatChip>
        </StatsRow>

        <FilterRow>
          <div>
            <div style={{ position:'relative', flex:'2 1 180px' }}>
              <MdSearch style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#475569', fontSize:17 }} />
              <Input placeholder="Search slot number..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:38 }} />
            </div>
            <Select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">All Categories</option>
              <option value="general">General</option>
              <option value="manager">Manager</option>
            </Select>
            <Select value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="four-wheeler">4-Wheeler</option>
              <option value="two-wheeler">2-Wheeler</option>
            </Select>
            {(search||filterCat||filterType) && (
              <Button variant="ghost" size="sm" onClick={() => {setSearch('');setFilterCat('');setFilterType('');}}>Clear</Button>
            )}
          </div>
        </FilterRow>

        {loading ? (
          <Flex justify="center" style={{ padding:60 }}><Spinner size="40px" /></Flex>
        ) : filtered.length===0 ? (
          <EmptyState>
            <div className="icon"><MdLocalParking /></div>
            <div className="title">{slots.length===0?'No slots yet':'No matching slots'}</div>
            <div className="desc">{slots.length===0?'Create your first parking slot.':'Try adjusting filters.'}</div>
            {slots.length===0 && <Button style={{ marginTop:16 }} onClick={openCreate}><MdAdd /> Create Slot</Button>}
          </EmptyState>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show">
            <Text muted size="12px" style={{ marginBottom:12 }}>Showing {filtered.length} of {total}</Text>
            <Grid cols="repeat(auto-fill, minmax(160px, 1fr))" mobileCols="1fr 1fr" gap="12px" mobileGap="8px">
              {filtered.map(slot => {
                const isActive = slot.isActive && slot.status!=='inactive';
                return (
                  <SlotCard key={slot._id} variants={cardAnim} cat={slot.category}>
                    <div className="top">
                      <div className="type-icon">{slot.slotType==='two-wheeler'?'🏍️':'🚗'}</div>
                      <Flex gap="5px" align="center" style={{ marginBottom:6 }}>
                        <StatusDot active={isActive} />
                        <span style={{ fontSize:9, fontWeight:700, color:isActive?'#10b981':'#ef4444', textTransform:'uppercase' }}>
                          {isActive?'Active':'Inactive'}
                        </span>
                      </Flex>
                      <div className="slot-num">{slot.slotNumber}</div>
                      <Flex gap="4px" wrap="wrap">
                        <Badge status={slot.category}>{slot.category}</Badge>
                        <Badge status={slot.status==='available'?'active':'inactive'}>
                          {slot.status==='available'?'Free':'Off'}
                        </Badge>
                      </Flex>
                    </div>
                    <div className="bottom">
                      <Text muted size="11px" style={{ marginBottom:8 }}>
                        {slot.slotType==='two-wheeler'?'🏍️':'🚗'} Floor {slot.floor||'G'}
                      </Text>
                      <Flex gap="5px">
                        <Button size="sm" variant="ghost" style={{ flex:1, padding:'7px 6px' }} onClick={() => openEdit(slot)}>
                          <MdEdit />
                        </Button>
                        <Button size="sm" variant={isActive?'warning':'success'} style={{ padding:'7px 6px' }}
                          onClick={() => toggleStatus(slot)}>
                          {isActive ? <MdBlock /> : <MdCheckCircle />}
                        </Button>
                        <Button size="sm" variant="danger" style={{ padding:'7px 6px' }}
                          onClick={() => openDelete(slot)}>
                          <MdDelete />
                        </Button>
                      </Flex>
                    </div>
                  </SlotCard>
                );
              })}
            </Grid>
          </motion.div>
        )}
      </PageWrapper>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(modal==='create'||modal==='edit') && (
          <ModalBackdrop initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={closeModal}>
            <ModalSheet as={motion.form} onSubmit={handleSave}
              onClick={e => e.stopPropagation()}
              initial={{ opacity:0, y:60 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:60 }} maxWidth="440px">
              <Flex justify="space-between" align="center" style={{ marginBottom:20 }}>
                <Title size="1.1rem">{modal==='create'?'➕ New Slot':'✏️ Edit Slot'}</Title>
                <button type="button" onClick={closeModal}
                  style={{ background:'none', border:'none', color:'#64748b', fontSize:22, cursor:'pointer', padding:4, minHeight:44, display:'flex', alignItems:'center' }}>
                  <MdClose />
                </button>
              </Flex>

              <Flex direction="column" gap="14px">
                <InputGroup>
                  <Label>Slot Number *</Label>
                  <Input placeholder="G-001, M-01, TW-01" required
                    value={form.slotNumber} onChange={e => setForm({...form, slotNumber:e.target.value.toUpperCase()})} />
                  <Text muted size="11px">G=General, M=Manager, TW=Two-Wheeler</Text>
                </InputGroup>
                <Flex gap="10px">
                  <InputGroup style={{ flex:1 }}>
                    <Label>Vehicle Type</Label>
                    <Select value={form.slotType} onChange={e => setForm({...form, slotType:e.target.value})}>
                      <option value="four-wheeler">🚗 4-Wheeler</option>
                      <option value="two-wheeler">🏍️ 2-Wheeler</option>
                    </Select>
                  </InputGroup>
                  <InputGroup style={{ flex:1 }}>
                    <Label>Category</Label>
                    <Select value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
                      <option value="general">General</option>
                      <option value="manager">Manager</option>
                    </Select>
                  </InputGroup>
                </Flex>
                <Flex gap="10px">
                  <InputGroup style={{ flex:1 }}>
                    <Label>Floor</Label>
                    <Input placeholder="G, B1, L1..." value={form.floor}
                      onChange={e => setForm({...form, floor:e.target.value.toUpperCase()})} />
                  </InputGroup>
                  <InputGroup style={{ flex:1 }}>
                    <Label>Status</Label>
                    <Select value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
                      <option value="available">Available</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  </InputGroup>
                </Flex>

                {/* Preview */}
                <div style={{ padding:'12px 14px', background:form.category==='manager'?'rgba(168,85,247,0.06)':'rgba(59,130,246,0.05)', borderRadius:10, border:`1px solid ${form.category==='manager'?'rgba(168,85,247,0.2)':'rgba(59,130,246,0.15)'}` }}>
                  <Text muted size="10px" style={{ textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Preview</Text>
                  <Flex gap="10px" align="center">
                    <span style={{ fontSize:22 }}>{form.slotType==='two-wheeler'?'🏍️':'🚗'}</span>
                    <div>
                      <Text style={{ fontFamily:'Orbitron,sans-serif', fontWeight:800, fontSize:16, color:form.category==='manager'?'#a855f7':'#3b82f6' }}>
                        {form.slotNumber||'SLOT-NUM'}
                      </Text>
                      <Flex gap="5px" style={{ marginTop:4 }}>
                        <Badge status={form.category}>{form.category}</Badge>
                        <Badge status={form.status==='available'?'active':'inactive'}>{form.status}</Badge>
                      </Flex>
                    </div>
                  </Flex>
                </div>
              </Flex>

              <Flex gap="10px" style={{ marginTop:20 }}>
                <Button type="button" variant="ghost" fullWidth onClick={closeModal}>Cancel</Button>
                <Button type="submit" fullWidth disabled={saving}>
                  {saving ? <Spinner size="16px" /> : modal==='create'?'✅ Create':'✅ Save'}
                </Button>
              </Flex>
            </ModalSheet>
          </ModalBackdrop>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {modal==='delete' && selectedSlot && (
          <ModalBackdrop initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={closeModal}>
            <ModalSheet onClick={e => e.stopPropagation()}
              initial={{ opacity:0, y:60 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:60 }} maxWidth="340px">
              <div style={{ textAlign:'center', padding:'8px 0 16px' }}>
                <div style={{ fontSize:42, marginBottom:14 }}>🗑️</div>
                <Title size="1rem" style={{ marginBottom:8 }}>Deactivate Slot?</Title>
                <Text muted size="13px">
                  Slot <strong style={{ color:'#f0f6ff' }}>{selectedSlot.slotNumber}</strong> will be hidden from users.
                </Text>
              </div>
              <Flex gap="10px">
                <Button variant="ghost" fullWidth onClick={closeModal}>Cancel</Button>
                <Button variant="danger" fullWidth onClick={handleDelete} disabled={saving}>
                  {saving ? <Spinner size="16px" /> : 'Deactivate'}
                </Button>
              </Flex>
            </ModalSheet>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </Layout>
  );
}