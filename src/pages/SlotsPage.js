// src/pages/SlotsPage.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdLocalParking, MdFilterList, MdBookmark, MdClose, MdInfoOutline, MdSearch } from 'react-icons/md';
import { slotAPI, bookingAPI } from '../services/api';
import {
  PageWrapper, PageHeader, Title, Text, Card, Badge, Button,
  Input, InputGroup, Label, Select, Flex, Grid,
  EmptyState, Spinner, ModalBackdrop, ModalSheet
} from '../components/common/UI';
import Layout from '../components/common/Layout';

const SlotCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ available, category }) =>
    !available ? 'rgba(239,68,68,0.2)' :
    category === 'manager' ? 'rgba(168,85,247,0.3)' : 'rgba(16,185,129,0.25)'};
  border-radius: 14px;
  overflow: hidden;
  cursor: ${({ available }) => available ? 'pointer' : 'default'};
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s;

  &:active { transform: ${({ available }) => available ? 'scale(0.97)' : 'none'}; }

  .top {
    padding: 14px 14px 10px;
    background: ${({ available, category }) =>
      !available ? 'rgba(239,68,68,0.04)' :
      category === 'manager' ? 'rgba(168,85,247,0.06)' : 'rgba(16,185,129,0.05)'};
    border-bottom: 1px solid ${({ available }) => available ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'};
    position: relative;
  }
  .slot-num {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.2rem;
    font-weight: 800;
    color: ${({ available, category }) =>
      !available ? '#ef4444' : category === 'manager' ? '#a855f7' : '#10b981'};
    margin-bottom: 6px;
  }
  .type-icon {
    position: absolute; right: 12px; top: 12px;
    font-size: 1.6rem; opacity: 0.15;
  }
  .bottom { padding: 10px 14px; }
`;

const FilterPanel = styled(Card)`
  padding: 14px 16px;
  margin-bottom: 16px;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: flex-end;

  > * { flex: 1 1 130px; }

  @media (max-width: 480px) {
    > * { flex: 1 1 calc(50% - 5px); min-width: 0; }
    > button { flex: 1 1 100%; }
  }
`;

const StatusDot = styled.span`
  display: inline-block;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: ${({ available }) => available ? '#10b981' : '#ef4444'};
  margin-right: 5px;
  flex-shrink: 0;
`;

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const cardAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function SlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    slotType: '',
  });
  const [searched, setSearched] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingForm, setBookingForm] = useState({ startTime: '09:00', endTime: '17:00' });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => { fetchSlots(); }, []);

  const fetchSlots = async (params) => {
    setLoading(true);
    try {
      const res = await slotAPI.getAll(params || {});
      setSlots(res.data.data);
    } catch { toast.error('Failed to load slots'); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { fetchSlots(filters); setSearched(true); };

  const openModal = (slot) => {
    setSelectedSlot(slot);
    setBookingForm({ startTime: filters.startTime, endTime: filters.endTime });
  };

  const handleBook = async () => {
    setBookingLoading(true);
    try {
      await bookingAPI.create({
        slotId: selectedSlot._id,
        bookingDate: filters.date,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
      });
      toast.success(`🎉 Slot ${selectedSlot.slotNumber} booked!`);
      setSelectedSlot(null);
      handleSearch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setBookingLoading(false); }
  };

  const filtered = slots.filter(s => {
    if (!s.isActive) return false;
    if (filters.slotType && s.slotType !== filters.slotType) return false;
    return true;
  });

  return (
    <Layout>
      <PageWrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader>
          <div>
            <Title size="1.6rem">Parking Slots</Title>
            <Text muted size="13px" style={{ marginTop: 3 }}>Search and book your spot</Text>
          </div>
        </PageHeader>

        {/* Filters */}
        <FilterPanel>
          <FilterRow>
            <InputGroup>
              <Label>Date</Label>
              <Input type="date" value={filters.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setFilters({ ...filters, date: e.target.value })} />
            </InputGroup>
            <InputGroup>
              <Label>From</Label>
              <Input type="time" value={filters.startTime}
                onChange={e => setFilters({ ...filters, startTime: e.target.value })} />
            </InputGroup>
            <InputGroup>
              <Label>To</Label>
              <Input type="time" value={filters.endTime}
                onChange={e => setFilters({ ...filters, endTime: e.target.value })} />
            </InputGroup>
            <InputGroup>
              <Label>Type</Label>
              <Select value={filters.slotType}
                onChange={e => setFilters({ ...filters, slotType: e.target.value })}>
                <option value="">All</option>
                <option value="four-wheeler">4-Wheeler 🚗</option>
                <option value="two-wheeler">2-Wheeler 🏍️</option>
              </Select>
            </InputGroup>
            <Button onClick={handleSearch} style={{ alignSelf: 'flex-end' }}>
              <MdSearch /> Search
            </Button>
          </FilterRow>
        </FilterPanel>

        {searched && (
          <Text muted size="12px" style={{ marginBottom: 14 }}>
            ✅ {filtered.filter(s => s.isAvailableForSlot !== false).length} available ·
            ❌ {filtered.filter(s => s.isAvailableForSlot === false).length} booked ·
            {filters.date} · {filters.startTime}–{filters.endTime}
          </Text>
        )}

        {loading ? (
          <Flex justify="center" style={{ padding: 60 }}><Spinner size="40px" /></Flex>
        ) : filtered.length === 0 ? (
          <EmptyState>
            <div className="icon"><MdLocalParking /></div>
            <div className="title">No slots found</div>
            <div className="desc">Try changing filters or ask admin to add slots.</div>
          </EmptyState>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show">
            <Grid cols="repeat(auto-fill, minmax(160px, 1fr))" mobileCols="1fr 1fr" gap="12px" mobileGap="10px">
              {filtered.map(slot => {
                const isAvail = !searched || slot.isAvailableForSlot !== false;
                return (
                  <SlotCard key={slot._id} variants={cardAnim}
                    available={isAvail} category={slot.category}
                    onClick={() => isAvail && openModal(slot)}>
                    <div className="top">
                      <div className="type-icon">{slot.slotType === 'two-wheeler' ? '🏍️' : '🚗'}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4, display:'flex', alignItems:'center' }}>
                        <StatusDot available={isAvail} />
                        <span style={{ color: isAvail ? '#10b981' : '#ef4444' }}>
                          {isAvail ? 'AVAILABLE' : 'BOOKED'}
                        </span>
                      </div>
                      <div className="slot-num">{slot.slotNumber}</div>
                      <Flex gap="5px" wrap="wrap">
                        <Badge status={slot.category}>{slot.category}</Badge>
                        <Badge status={slot.slotType === 'two-wheeler' ? 'waiting' : 'active'}>
                          {slot.slotType === 'two-wheeler' ? '2W' : '4W'}
                        </Badge>
                      </Flex>
                    </div>
                    <div className="bottom">
                      <Text muted size="11px" style={{ marginBottom: isAvail ? 8 : 0 }}>
                        Floor {slot.floor || 'G'}
                      </Text>
                      {isAvail && (
                        <Button fullWidth size="sm" onClick={e => { e.stopPropagation(); openModal(slot); }}>
                          <MdBookmark /> Book
                        </Button>
                      )}
                    </div>
                  </SlotCard>
                );
              })}
            </Grid>
          </motion.div>
        )}
      </PageWrapper>

      {/* Booking Modal — bottom sheet on mobile */}
      <AnimatePresence>
        {selectedSlot && (
          <ModalBackdrop
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedSlot(null)}>
            <ModalSheet
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}>

              <Flex justify="space-between" align="center" style={{ marginBottom: 18 }}>
                <Title size="1.1rem">Book Slot</Title>
                <button onClick={() => setSelectedSlot(null)}
                  style={{ background:'none', border:'none', color:'#64748b', fontSize:22, cursor:'pointer', padding:4, minHeight:44, display:'flex', alignItems:'center' }}>
                  <MdClose />
                </button>
              </Flex>

              <Card style={{ marginBottom: 18, padding:14, background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.18)' }}>
                <Flex gap="12px" align="center">
                  <div style={{ fontSize: 26 }}>{selectedSlot.slotType === 'two-wheeler' ? '🏍️' : '🚗'}</div>
                  <div>
                    <Text style={{ fontWeight: 800, fontSize: 18, fontFamily:'Orbitron,sans-serif' }}>
                      {selectedSlot.slotNumber}
                    </Text>
                    <Flex gap="5px" style={{ marginTop: 4 }}>
                      <Badge status={selectedSlot.category}>{selectedSlot.category}</Badge>
                      <Badge status="active">Floor {selectedSlot.floor || 'G'}</Badge>
                    </Flex>
                  </div>
                </Flex>
              </Card>

              <div style={{ display:'flex', flexDirection:'column', gap: 12, marginBottom: 14 }}>
                <InputGroup>
                  <Label>Date</Label>
                  <Input type="date" value={filters.date} readOnly />
                </InputGroup>
                <Flex gap="10px">
                  <InputGroup style={{ flex:1 }}>
                    <Label>Start</Label>
                    <Input type="time" value={bookingForm.startTime}
                      onChange={e => setBookingForm({ ...bookingForm, startTime: e.target.value })} />
                  </InputGroup>
                  <InputGroup style={{ flex:1 }}>
                    <Label>End</Label>
                    <Input type="time" value={bookingForm.endTime}
                      onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })} />
                  </InputGroup>
                </Flex>
              </div>

              <Flex gap="5px" style={{ padding:'10px 12px', background:'rgba(245,158,11,0.07)', borderRadius:10, border:'1px solid rgba(245,158,11,0.2)', marginBottom:18 }}>
                <MdInfoOutline color="#f59e0b" size={16} style={{ flexShrink:0, marginTop:1 }} />
                <Text size="12px" muted>
                  <strong style={{ color:'#f59e0b' }}>15-min grace period</strong> to mark arrival after start time.
                </Text>
              </Flex>

              <Flex gap="10px">
                <Button variant="ghost" fullWidth onClick={() => setSelectedSlot(null)}>Cancel</Button>
                <Button fullWidth onClick={handleBook} disabled={bookingLoading}>
                  {bookingLoading ? <Spinner size="16px" /> : '🎉 Confirm'}
                </Button>
              </Flex>
            </ModalSheet>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </Layout>
  );
}
