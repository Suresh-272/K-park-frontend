// src/pages/SlotsPage.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  MdLocalParking, MdFilterList, MdBookmark, MdClose, MdInfoOutline, MdSearch
} from 'react-icons/md';
import { slotAPI, bookingAPI } from '../services/api';
import {
  PageWrapper, PageHeader, Title, Text, Card, Badge,
  Button, Input, InputGroup, Label, Select, Flex, Grid,
  EmptyState, Spinner, GlassCard, ModalBackdrop, ModalSheet
} from '../components/common/UI';
import Layout from '../components/common/Layout';

// ── Custom props filtered from DOM ─────────────────────────────────────────
const SlotCard = styled(motion.div).withConfig({
  shouldForwardProp: (p) => !['isAvail', 'category'].includes(p),
})`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ isAvail }) => isAvail ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  cursor: ${({ isAvail }) => isAvail ? 'pointer' : 'default'};
  transition: all 0.2s;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: ${({ isAvail, category }) =>
      !isAvail ? 'linear-gradient(90deg,#ef4444,#dc2626)' :
      category === 'manager' ? 'linear-gradient(90deg,#a855f7,#7c3aed)' :
      'linear-gradient(90deg,#10b981,#059669)'};
  }

  &:active { transform: ${({ isAvail }) => isAvail ? 'scale(0.97)' : 'none'}; }

  .top {
    padding: 14px 14px 10px;
    position: relative;
  }
  .slot-number {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    color: ${({ isAvail }) => isAvail ? '#10b981' : '#ef4444'};
    margin-bottom: 8px;
  }
  .slot-icon {
    position: absolute;
    right: 12px; top: 12px;
    font-size: 1.6rem;
    opacity: 0.12;
  }
  .bottom {
    padding: 10px 14px 14px;
  }
`;

const StatusDot = styled.div.withConfig({
  shouldForwardProp: (p) => p !== 'isAvail',
})`
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ isAvail }) => isAvail ? '#10b981' : '#ef4444'};
  box-shadow: 0 0 6px ${({ isAvail }) => isAvail ? 'rgba(16,185,129,0.6)' : 'rgba(239,68,68,0.5)'};
`;

const FilterPanel = styled(Card)`
  padding: 16px;
  margin-bottom: 18px;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr) auto;
  gap: 10px;
  align-items: flex-end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    > button { grid-column: 1 / -1; }
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }
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
      const data = res?.data?.data;
      setSlots(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load slots'); setSlots([]); }
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
      if (err.response?.data?.suggestWaitlist) {
        toast('💡 Try joining the waitlist!', { icon: '📋' });
      }
    } finally { setBookingLoading(false); }
  };

  const filteredSlots = slots.filter(s => {
    if (!s || !s._id || !s.isActive) return false;
    if (filters.slotType && s.slotType !== filters.slotType) return false;
    return true;
  });

  const availCount = filteredSlots.filter(s => s.isAvailableForSlot !== false).length;
  const bookedCount = filteredSlots.filter(s => s.isAvailableForSlot === false).length;

  return (
    <Layout>
      <PageWrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader>
          <div>
            <Title size="1.6rem">Parking Slots</Title>
            <Text muted size="13px" style={{ marginTop: 3 }}>Search and book your spot</Text>
          </div>
        </PageHeader>

        {/* Filter */}
        <FilterPanel>
          <FilterGrid>
            <InputGroup>
              <Label>Date</Label>
              <Input type="date" value={filters.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setFilters({ ...filters, date: e.target.value })} />
            </InputGroup>
            <InputGroup>
              <Label>Start Time</Label>
              <Input type="time" value={filters.startTime}
                onChange={e => setFilters({ ...filters, startTime: e.target.value })} />
            </InputGroup>
            <InputGroup>
              <Label>End Time</Label>
              <Input type="time" value={filters.endTime}
                onChange={e => setFilters({ ...filters, endTime: e.target.value })} />
            </InputGroup>
            <InputGroup>
              <Label>Vehicle Type</Label>
              <Select value={filters.slotType}
                onChange={e => setFilters({ ...filters, slotType: e.target.value })}>
                <option value="">All Types</option>
                <option value="four-wheeler">🚗 4-Wheeler</option>
                <option value="two-wheeler">🏍️ 2-Wheeler</option>
              </Select>
            </InputGroup>
            <Button onClick={handleSearch}>
              <MdSearch /> Search
            </Button>
          </FilterGrid>
        </FilterPanel>

        {searched && !loading && (
          <Text muted size="12px" style={{ marginBottom: 14 }}>
            ✅ {availCount} available · ❌ {bookedCount} booked ·{' '}
            {filters.date} · {filters.startTime}–{filters.endTime}
          </Text>
        )}

        {loading ? (
          <Flex justify="center" style={{ padding: 60 }}>
            <Spinner size="40px" />
          </Flex>
        ) : filteredSlots.length === 0 ? (
          <EmptyState>
            <div className="icon"><MdLocalParking /></div>
            <div className="title">No slots found</div>
            <div className="desc">Try changing filters or ask admin to add slots.</div>
          </EmptyState>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show">
            <Grid cols="repeat(auto-fill, minmax(180px, 1fr))" mobileCols="1fr 1fr" gap="12px" mobileGap="8px">
              {filteredSlots.map(slot => {
                const isAvail = !searched || slot.isAvailableForSlot !== false;
                return (
                  <SlotCard
                    key={slot._id}
                    variants={cardAnim}
                    isAvail={isAvail}
                    category={slot.category || 'general'}
                    onClick={() => isAvail && openModal(slot)}
                  >
                    <div className="top">
                      <div className="slot-icon">
                        {slot.slotType === 'two-wheeler' ? '🏍️' : '🚗'}
                      </div>
                      <Flex gap="6px" align="center" style={{ marginBottom: 8 }}>
                        <StatusDot isAvail={isAvail} />
                        <span style={{
                          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                          color: isAvail ? '#10b981' : '#ef4444'
                        }}>
                          {isAvail ? 'Available' : 'Booked'}
                        </span>
                      </Flex>
                      <div className="slot-number">{slot.slotNumber}</div>
                      <Flex gap="5px" wrap="wrap">
                        <Badge status={slot.category || 'general'}>{slot.category || 'general'}</Badge>
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
                        <Button fullWidth size="sm"
                          onClick={e => { e.stopPropagation(); openModal(slot); }}>
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
            onClick={() => setSelectedSlot(null)}
          >
            <ModalSheet
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              maxWidth="440px"
            >
              <Flex justify="space-between" align="center" style={{ marginBottom: 18 }}>
                <div>
                  <Title size="1.1rem">Book Slot</Title>
                  <Text muted size="12px">Confirm your reservation</Text>
                </div>
                <button onClick={() => setSelectedSlot(null)} style={{
                  background: 'none', border: 'none', color: '#64748b',
                  fontSize: 22, cursor: 'pointer', padding: 4,
                  minHeight: 44, display: 'flex', alignItems: 'center'
                }}>
                  <MdClose />
                </button>
              </Flex>

              {/* Slot preview */}
              <div style={{
                padding: '14px 16px', marginBottom: 18, borderRadius: 12,
                background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)'
              }}>
                <Flex gap="12px" align="center">
                  <span style={{ fontSize: 28 }}>
                    {selectedSlot.slotType === 'two-wheeler' ? '🏍️' : '🚗'}
                  </span>
                  <div>
                    <Text style={{ fontWeight: 800, fontSize: 18, fontFamily: 'Orbitron, sans-serif' }}>
                      {selectedSlot.slotNumber}
                    </Text>
                    <Flex gap="5px" style={{ marginTop: 4 }}>
                      <Badge status={selectedSlot.category || 'general'}>
                        {selectedSlot.category || 'general'}
                      </Badge>
                      <Badge status="active">Floor {selectedSlot.floor || 'G'}</Badge>
                    </Flex>
                  </div>
                </Flex>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
                <InputGroup>
                  <Label>Date</Label>
                  <Input type="date" value={filters.date} readOnly />
                </InputGroup>
                <Flex gap="10px">
                  <InputGroup style={{ flex: 1 }}>
                    <Label>Start Time</Label>
                    <Input type="time" value={bookingForm.startTime}
                      onChange={e => setBookingForm({ ...bookingForm, startTime: e.target.value })} />
                  </InputGroup>
                  <InputGroup style={{ flex: 1 }}>
                    <Label>End Time</Label>
                    <Input type="time" value={bookingForm.endTime}
                      onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })} />
                  </InputGroup>
                </Flex>
              </div>

              {/* Grace period warning */}
              <Flex gap="8px" style={{
                padding: '10px 12px', marginBottom: 20,
                background: 'rgba(245,158,11,0.07)', borderRadius: 10,
                border: '1px solid rgba(245,158,11,0.2)'
              }}>
                <MdInfoOutline color="#f59e0b" size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <Text size="12px" muted>
                  <strong style={{ color: '#f59e0b' }}>120-min grace period</strong> to mark
                  arrival after start time, or booking auto-cancels.
                </Text>
              </Flex>

              <Flex gap="10px">
                <Button variant="ghost" fullWidth onClick={() => setSelectedSlot(null)}>
                  Cancel
                </Button>
                <Button fullWidth onClick={handleBook} disabled={bookingLoading}>
                  {bookingLoading ? <Spinner size="16px" /> : '🎉 Confirm Booking'}
                </Button>
              </Flex>
            </ModalSheet>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </Layout>
  );
}