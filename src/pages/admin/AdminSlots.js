// src/pages/admin/AdminSlots.js
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  MdAdd, MdEdit, MdDelete, MdClose, MdLocalParking,
  MdSearch, MdFilterList, MdCheckCircle, MdBlock,
  MdDirectionsCar, MdTwoWheeler, MdMeetingRoom
} from 'react-icons/md';
import { slotAPI } from '../../services/api';
import {
  PageWrapper, PageHeader, Title, Text, Card, GlassCard,
  Badge, Button, Flex, Grid, Input, Select, InputGroup,
  Label, EmptyState, Spinner, SectionTitle
} from '../../components/common/UI';
import Layout from '../../components/common/Layout';

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.95); }
`;

const SlotCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ cat, theme }) =>
    cat === 'manager' ? 'rgba(168,85,247,0.25)' : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 0;
  overflow: hidden;
  transition: all 0.25s;
  position: relative;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 36px rgba(0,0,0,0.3);
    border-color: ${({ cat }) =>
      cat === 'manager' ? 'rgba(168,85,247,0.5)' : 'rgba(59,130,246,0.4)'};
  }
`;

const SlotTop = styled.div`
  padding: 18px 18px 14px;
  background: ${({ cat }) =>
    cat === 'manager'
      ? 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(124,58,237,0.04))'
      : 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(6,182,212,0.03))'};
  border-bottom: 1px solid ${({ cat }) =>
    cat === 'manager' ? 'rgba(168,85,247,0.12)' : 'rgba(59,130,246,0.08)'};
  position: relative;
`;

const SlotNumber = styled.div`
  font-family: 'Orbitron', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: ${({ cat }) => cat === 'manager' ? '#a855f7' : '#3b82f6'};
  margin-bottom: 8px;
`;

const SlotBottom = styled.div`
  padding: 14px 18px;
`;

const StatusIndicator = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ active }) => active ? '#10b981' : '#ef4444'};
  box-shadow: 0 0 8px ${({ active }) => active ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'};
  ${({ active }) => active && `animation: ${pulse} 2s ease-in-out infinite;`}
`;

const TypeIcon = styled.div`
  font-size: 2rem;
  position: absolute;
  bottom: 12px;
  right: 14px;
  opacity: 0.15;
`;

const Modal = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;
const Overlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(10px);
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 28px;
`;

const StatChip = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ color }) => color || 'rgba(59,130,246,0.2)'};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 14px 16px;

  .val {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: ${({ color }) => color?.replace('0.2', '1') || '#3b82f6'};
    line-height: 1;
  }
  .lbl {
    font-size: 11px;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 4px;
  }
`;

const FilterBar = styled(Card)`
  padding: 16px 20px;
  margin-bottom: 24px;
`;

const emptyForm = {
  slotNumber: '',
  slotType: 'four-wheeler',
  category: 'general',
  floor: 'G',
  status: 'available',
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const cardAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function AdminSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'delete'
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => { fetchSlots(); }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await slotAPI.getAll();
      setSlots(res.data.data);
    } catch { toast.error('Failed to load slots'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setSelectedSlot(null);
    setModal('create');
  };

  const openEdit = (slot) => {
    setSelectedSlot(slot);
    setForm({
      slotNumber: slot.slotNumber,
      slotType: slot.slotType,
      category: slot.category,
      floor: slot.floor || 'G',
      status: slot.status,
    });
    setModal('edit');
  };

  const openDelete = (slot) => {
    setSelectedSlot(slot);
    setModal('delete');
  };

  const closeModal = () => {
    setModal(null);
    setSelectedSlot(null);
    setForm(emptyForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await slotAPI.create(form);
        toast.success(`✅ Slot ${form.slotNumber} created!`);
      } else {
        await slotAPI.update(selectedSlot._id, form);
        toast.success(`✅ Slot ${form.slotNumber} updated!`);
      }
      closeModal();
      fetchSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save slot');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await slotAPI.delete(selectedSlot._id);
      toast.success(`Slot ${selectedSlot.slotNumber} deactivated.`);
      closeModal();
      fetchSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const toggleStatus = async (slot) => {
    try {
      const newStatus = slot.status === 'available' ? 'inactive' : 'available';
      await slotAPI.update(slot._id, { status: newStatus, isActive: newStatus !== 'inactive' });
      toast.success(`Slot ${slot.slotNumber} ${newStatus === 'available' ? 'activated' : 'deactivated'}`);
      fetchSlots();
    } catch { toast.error('Failed to update status'); }
  };

  // Filtered list
  const filtered = slots.filter(s => {
    if (search && !s.slotNumber.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat && s.category !== filterCat) return false;
    if (filterType && s.slotType !== filterType) return false;
    return true;
  });

  // Stats
  const total = slots.length;
  const available = slots.filter(s => s.status === 'available').length;
  const managerSlots = slots.filter(s => s.category === 'manager').length;
  const twoWheeler = slots.filter(s => s.slotType === 'two-wheeler').length;
  const inactive = slots.filter(s => !s.isActive || s.status === 'inactive').length;

  return (
    <Layout>
      <PageWrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader>
          <div>
            <Title size="1.8rem">Slot Management</Title>
            <Text muted size="14px" style={{ marginTop: 4 }}>
              Create, configure and manage all parking slots
            </Text>
          </div>
          <Button onClick={openCreate} size="lg">
            <MdAdd /> Add New Slot
          </Button>
        </PageHeader>

        {/* Stats */}
        <StatsRow>
          <StatChip color="rgba(59,130,246,0.3)">
            <div className="val">{total}</div>
            <div className="lbl">Total Slots</div>
          </StatChip>
          <StatChip color="rgba(16,185,129,0.3)">
            <div className="val">{available}</div>
            <div className="lbl">Available</div>
          </StatChip>
          <StatChip color="rgba(168,85,247,0.3)">
            <div className="val">{managerSlots}</div>
            <div className="lbl">Manager</div>
          </StatChip>
          <StatChip color="rgba(245,158,11,0.3)">
            <div className="val">{twoWheeler}</div>
            <div className="lbl">2-Wheeler</div>
          </StatChip>
          <StatChip color="rgba(239,68,68,0.3)">
            <div className="val">{inactive}</div>
            <div className="lbl">Inactive</div>
          </StatChip>
        </StatsRow>

        {/* Filter */}
        <FilterBar>
          <Flex gap="12px" wrap="wrap" align="flex-end">
            <div style={{ position: 'relative', flex: '2 1 200px' }}>
              <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: 18 }} />
              <Input placeholder="Search slot number..." value={search}
                onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
            </div>
            <Select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ flex: '1 1 140px' }}>
              <option value="">All Categories</option>
              <option value="general">General</option>
              <option value="manager">Manager</option>
            </Select>
            <Select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ flex: '1 1 140px' }}>
              <option value="">All Types</option>
              <option value="four-wheeler">4-Wheeler 🚗</option>
              <option value="two-wheeler">2-Wheeler 🏍️</option>
            </Select>
            {(search || filterCat || filterType) && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterCat(''); setFilterType(''); }}>
                Clear
              </Button>
            )}
          </Flex>
        </FilterBar>

        {loading ? (
          <Flex justify="center" style={{ padding: 80 }}><Spinner size="40px" /></Flex>
        ) : filtered.length === 0 ? (
          <EmptyState>
            <div className="icon"><MdLocalParking /></div>
            <div className="title">{slots.length === 0 ? 'No slots yet' : 'No matching slots'}</div>
            <div className="desc">{slots.length === 0 ? 'Create your first parking slot to get started.' : 'Try adjusting the filters.'}</div>
            {slots.length === 0 && (
              <Button style={{ marginTop: 20 }} onClick={openCreate}><MdAdd /> Create First Slot</Button>
            )}
          </EmptyState>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show">
            <Text muted size="13px" style={{ marginBottom: 16 }}>
              Showing {filtered.length} of {total} slots
            </Text>
            <Grid cols="repeat(auto-fill, minmax(210px, 1fr))" gap="16px">
              {filtered.map(slot => (
                <SlotCard key={slot._id} variants={cardAnim} cat={slot.category}>
                  <SlotTop cat={slot.category}>
                    <StatusIndicator active={slot.isActive && slot.status !== 'inactive'} />
                    <TypeIcon>{slot.slotType === 'two-wheeler' ? '🏍️' : '🚗'}</TypeIcon>
                    <SlotNumber cat={slot.category}>{slot.slotNumber}</SlotNumber>
                    <Flex gap="6px" wrap="wrap">
                      <Badge status={slot.category}>{slot.category}</Badge>
                      <Badge status={slot.status === 'available' ? 'active' : 'cancelled'}>
                        {slot.status}
                      </Badge>
                    </Flex>
                  </SlotTop>
                  <SlotBottom>
                    <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                      <Text muted size="12px">
                        {slot.slotType === 'two-wheeler' ? '🏍️ 2-Wheeler' : '🚗 4-Wheeler'}
                      </Text>
                      <Text muted size="12px">Floor: {slot.floor || 'G'}</Text>
                    </Flex>
                    <Flex gap="6px">
                      <Button size="sm" variant="ghost" style={{ flex: 1 }} onClick={() => openEdit(slot)}>
                        <MdEdit /> Edit
                      </Button>
                      <Button size="sm"
                        variant={slot.status !== 'inactive' ? 'warning' : 'success'}
                        onClick={() => toggleStatus(slot)}
                        title={slot.status !== 'inactive' ? 'Deactivate' : 'Activate'}>
                        {slot.status !== 'inactive' ? <MdBlock /> : <MdCheckCircle />}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => openDelete(slot)}>
                        <MdDelete />
                      </Button>
                    </Flex>
                  </SlotBottom>
                </SlotCard>
              ))}
            </Grid>
          </motion.div>
        )}
      </PageWrapper>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {(modal === 'create' || modal === 'edit') && (
          <Modal>
            <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal} />
            <GlassCard as={motion.form} onSubmit={handleSave}
              style={{
                position: 'relative', zIndex: 1, width: '100%', maxWidth: 460,
                border: '1px solid rgba(59,130,246,0.3)',
              }}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}>

              <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
                <div>
                  <Title size="1.2rem">
                    {modal === 'create' ? '➕ Create New Slot' : `✏️ Edit Slot ${selectedSlot?.slotNumber}`}
                  </Title>
                  <Text muted size="13px">
                    {modal === 'create' ? 'Configure the new parking slot' : 'Update slot configuration'}
                  </Text>
                </div>
                <button type="button" onClick={closeModal}
                  style={{ background: 'none', border: 'none', color: '#475569', fontSize: 22, cursor: 'pointer' }}>
                  <MdClose />
                </button>
              </Flex>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Slot Number */}
                <InputGroup>
                  <Label>Slot Number *</Label>
                  <Input
                    placeholder="e.g. G-001, M-01, TW-01"
                    required
                    value={form.slotNumber}
                    onChange={e => setForm({ ...form, slotNumber: e.target.value.toUpperCase() })}
                  />
                  <Text muted size="11px" style={{ marginTop: 4 }}>
                    Tip: G = General, M = Manager, TW = Two-Wheeler
                  </Text>
                </InputGroup>

                {/* Type + Category side by side */}
                <Flex gap="12px">
                  <InputGroup style={{ flex: 1 }}>
                    <Label>Vehicle Type *</Label>
                    <Select value={form.slotType}
                      onChange={e => setForm({ ...form, slotType: e.target.value })}>
                      <option value="four-wheeler">🚗 Four Wheeler</option>
                      <option value="two-wheeler">🏍️ Two Wheeler</option>
                    </Select>
                  </InputGroup>
                  <InputGroup style={{ flex: 1 }}>
                    <Label>Category *</Label>
                    <Select value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="general">General</option>
                      <option value="manager">Manager</option>
                    </Select>
                  </InputGroup>
                </Flex>

                {/* Floor + Status */}
                <Flex gap="12px">
                  <InputGroup style={{ flex: 1 }}>
                    <Label>Floor</Label>
                    <Input placeholder="G, B1, L1..."
                      value={form.floor}
                      onChange={e => setForm({ ...form, floor: e.target.value.toUpperCase() })} />
                  </InputGroup>
                  <InputGroup style={{ flex: 1 }}>
                    <Label>Status</Label>
                    <Select value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}>
                      <option value="available">Available</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  </InputGroup>
                </Flex>

                {/* Preview */}
                <div style={{
                  padding: '14px 16px',
                  background: form.category === 'manager' ? 'rgba(168,85,247,0.06)' : 'rgba(59,130,246,0.06)',
                  border: `1px solid ${form.category === 'manager' ? 'rgba(168,85,247,0.2)' : 'rgba(59,130,246,0.15)'}`,
                  borderRadius: 10,
                }}>
                  <Text muted size="11px" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Preview</Text>
                  <Flex gap="10px" align="center">
                    <span style={{ fontSize: 24 }}>{form.slotType === 'two-wheeler' ? '🏍️' : '🚗'}</span>
                    <div>
                      <Text style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 800, fontSize: 18, color: form.category === 'manager' ? '#a855f7' : '#3b82f6' }}>
                        {form.slotNumber || 'SLOT-NUM'}
                      </Text>
                      <Flex gap="6px" style={{ marginTop: 4 }}>
                        <Badge status={form.category}>{form.category}</Badge>
                        <Badge status={form.status === 'available' ? 'active' : 'cancelled'}>{form.status}</Badge>
                        <Badge status="general">Floor {form.floor || 'G'}</Badge>
                      </Flex>
                    </div>
                  </Flex>
                </div>
              </div>

              <Flex gap="10px" style={{ marginTop: 24 }}>
                <Button type="button" variant="ghost" fullWidth onClick={closeModal}>Cancel</Button>
                <Button type="submit" fullWidth disabled={saving}>
                  {saving ? <Spinner size="16px" /> : modal === 'create' ? '✅ Create Slot' : '✅ Save Changes'}
                </Button>
              </Flex>
            </GlassCard>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {modal === 'delete' && selectedSlot && (
          <Modal>
            <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal} />
            <GlassCard as={motion.div}
              style={{
                position: 'relative', zIndex: 1, width: '100%', maxWidth: 380,
                border: '1px solid rgba(239,68,68,0.3)',
              }}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}>
              <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
                <Title size="1.1rem" style={{ marginBottom: 8 }}>Deactivate Slot?</Title>
                <Text muted size="14px">
                  Slot <strong style={{ color: '#f0f6ff' }}>{selectedSlot.slotNumber}</strong> will be
                  deactivated and hidden from users. Existing bookings are not affected.
                </Text>
              </div>
              <Flex gap="10px">
                <Button variant="ghost" fullWidth onClick={closeModal}>Cancel</Button>
                <Button variant="danger" fullWidth onClick={handleDelete} disabled={saving}>
                  {saving ? <Spinner size="16px" /> : '🗑️ Deactivate'}
                </Button>
              </Flex>
            </GlassCard>
          </Modal>
        )}
      </AnimatePresence>
    </Layout>
  );
}
