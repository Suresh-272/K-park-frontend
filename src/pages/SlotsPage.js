// src/pages/SlotsPage.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  MdLocalParking, MdDirectionsCar, MdTwoWheeler,
  MdFilterList, MdBookmark, MdClose, MdInfoOutline
} from 'react-icons/md';
import { slotAPI, bookingAPI } from '../services/api';
import {
  PageWrapper, PageHeader, Title, Text, Card, Badge,
  Button, Input, InputGroup, Label, Select, Flex, Grid,
  SectionTitle, EmptyState, Spinner, GlassCard
} from '../components/common/UI';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext';

const SlotCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ available, theme }) =>
    available ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 20px;
  transition: all 0.25s;
  position: relative;
  overflow: hidden;
  cursor: ${({ available }) => available ? 'pointer' : 'default'};

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: ${({ available, category }) =>
      !available ? 'linear-gradient(90deg, #ef4444, #dc2626)' :
      category === 'manager' ? 'linear-gradient(90deg, #a855f7, #7c3aed)' :
      'linear-gradient(90deg, #10b981, #059669)'};
  }

  &:hover {
    border-color: ${({ available, theme }) => available ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.3)'};
    transform: ${({ available }) => available ? 'translateY(-3px)' : 'none'};
    box-shadow: ${({ available }) => available ? '0 8px 32px rgba(16,185,129,0.15)' : 'none'};
  }

  .slot-number {
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 1.4rem;
    font-weight: 700;
    color: ${({ available }) => available ? '#10b981' : '#ef4444'};
    margin-bottom: 8px;
  }
  .slot-icon {
    font-size: 2rem;
    position: absolute;
    right: 16px;
    top: 16px;
    opacity: 0.15;
  }
`;

const FilterBar = styled(Card)`
  padding: 20px 24px;
  margin-bottom: 24px;
`;

const BookingModal = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
`;

const ModalCard = styled(GlassCard)`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  border: 1px solid rgba(59,130,246,0.3);
`;

const SlotStatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ available }) => available ? '#10b981' : '#ef4444'};
  box-shadow: 0 0 8px ${({ available }) => available ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'};
  animation: ${({ available }) => available ? 'pulse-ring 2s ease-out infinite' : 'none'};
`;

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const cardAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function SlotsPage() {
  const { user } = useAuth();
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

  const handleSearch = () => {
    fetchSlots(filters);
    setSearched(true);
  };

  const openBookingModal = (slot) => {
    if (!slot.isAvailableForSlot && searched) {
      toast.error('This slot is not available for the selected time.');
      return;
    }
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
      toast.success(`🎉 Slot ${selectedSlot.slotNumber} booked! Check WhatsApp for confirmation.`);
      setSelectedSlot(null);
      handleSearch();
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed';
      toast.error(msg);
      if (err.response?.data?.suggestWaitlist) {
        toast('💡 All slots booked? Try joining the waitlist!', { icon: '📋' });
      }
    } finally { setBookingLoading(false); }
  };

  const filteredSlots = slots.filter(s => {
    if (!s.isActive) return false;
    if (filters.slotType && s.slotType !== filters.slotType) return false;
    return true;
  });

  const available = filteredSlots.filter(s => s.isAvailableForSlot !== false);
  const unavailable = filteredSlots.filter(s => s.isAvailableForSlot === false);

  return (
    <Layout>
      <PageWrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader>
          <div>
            <Title size="1.8rem">Parking Slots</Title>
            <Text muted size="14px" style={{ marginTop: 4 }}>
              Search availability and book your spot
            </Text>
          </div>
        </PageHeader>

        {/* Filter Bar */}
        <FilterBar>
          <Flex gap="12px" wrap="wrap" align="flex-end">
            <InputGroup style={{ flex: '1 1 140px' }}>
              <Label>Date</Label>
              <Input type="date" value={filters.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setFilters({ ...filters, date: e.target.value })} />
            </InputGroup>
            <InputGroup style={{ flex: '1 1 120px' }}>
              <Label>Start Time</Label>
              <Input type="time" value={filters.startTime}
                onChange={e => setFilters({ ...filters, startTime: e.target.value })} />
            </InputGroup>
            <InputGroup style={{ flex: '1 1 120px' }}>
              <Label>End Time</Label>
              <Input type="time" value={filters.endTime}
                onChange={e => setFilters({ ...filters, endTime: e.target.value })} />
            </InputGroup>
            <InputGroup style={{ flex: '1 1 140px' }}>
              <Label>Vehicle Type</Label>
              <Select value={filters.slotType}
                onChange={e => setFilters({ ...filters, slotType: e.target.value })}>
                <option value="">All Types</option>
                <option value="four-wheeler">Four Wheeler 🚗</option>
                <option value="two-wheeler">Two Wheeler 🏍️</option>
              </Select>
            </InputGroup>
            <Button onClick={handleSearch} style={{ minWidth: 140 }}>
              <MdFilterList /> Check Availability
            </Button>
          </Flex>
        </FilterBar>

        {loading ? (
          <Flex justify="center" style={{ padding: 60 }}>
            <Spinner size="40px" />
          </Flex>
        ) : (
          <>
            {searched && (
              <Flex gap="16px" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
                <Text muted size="13px">
                  ✅ {available.length} available &nbsp;·&nbsp; ❌ {unavailable.length} booked
                  &nbsp;·&nbsp; {filters.date} &nbsp;·&nbsp; {filters.startTime}–{filters.endTime}
                </Text>
              </Flex>
            )}

            {filteredSlots.length === 0 ? (
              <EmptyState>
                <div className="icon"><MdLocalParking /></div>
                <div className="title">No slots found</div>
                <div className="desc">Try changing filters or ask admin to add slots.</div>
              </EmptyState>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show">
                <Grid cols="repeat(auto-fill, minmax(200px, 1fr))" gap="16px">
                  {filteredSlots.map(slot => {
                    const isAvail = !searched || slot.isAvailableForSlot !== false;
                    return (
                      <SlotCard
                        key={slot._id}
                        variants={cardAnim}
                        available={isAvail}
                        category={slot.category}
                        onClick={() => isAvail && openBookingModal(slot)}
                      >
                        <div className="slot-icon">
                          {slot.slotType === 'two-wheeler' ? '🏍️' : '🚗'}
                        </div>
                        <Flex gap="8px" align="center" style={{ marginBottom: 12 }}>
                          <SlotStatusDot available={isAvail} />
                          <span style={{ fontSize: 11, color: isAvail ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                            {isAvail ? 'AVAILABLE' : 'BOOKED'}
                          </span>
                        </Flex>
                        <div className="slot-number">{slot.slotNumber}</div>
                        <Flex gap="6px" wrap="wrap">
                          <Badge status={slot.category}>{slot.category}</Badge>
                          <Badge status={slot.slotType === 'two-wheeler' ? 'waiting' : 'active'}>
                            {slot.slotType === 'two-wheeler' ? '2W' : '4W'}
                          </Badge>
                        </Flex>
                        <Text muted size="12px" style={{ marginTop: 8 }}>Floor: {slot.floor || 'G'}</Text>
                        {isAvail && (
                          <Button fullWidth size="sm" style={{ marginTop: 14 }}
                            onClick={e => { e.stopPropagation(); openBookingModal(slot); }}>
                            <MdBookmark /> Book Now
                          </Button>
                        )}
                      </SlotCard>
                    );
                  })}
                </Grid>
              </motion.div>
            )}
          </>
        )}
      </PageWrapper>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedSlot && (
          <BookingModal>
            <ModalOverlay
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedSlot(null)}
            />
            <ModalCard
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
                <div>
                  <Title size="1.2rem">Book Slot</Title>
                  <Text muted size="13px">Confirm your reservation</Text>
                </div>
                <button onClick={() => setSelectedSlot(null)} style={{ background:'none', border:'none', color:'#64748b', fontSize:20, cursor:'pointer' }}>
                  <MdClose />
                </button>
              </Flex>

              <Card style={{ marginBottom: 20, padding: 16, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <Flex gap="12px">
                  <div style={{ fontSize: 28 }}>{selectedSlot.slotType === 'two-wheeler' ? '🏍️' : '🚗'}</div>
                  <div>
                    <Text style={{ fontWeight: 700, fontSize: 16 }}>Slot {selectedSlot.slotNumber}</Text>
                    <Flex gap="6px" style={{ marginTop: 4 }}>
                      <Badge status={selectedSlot.category}>{selectedSlot.category}</Badge>
                      <Badge status="active">Floor {selectedSlot.floor || 'G'}</Badge>
                    </Flex>
                  </div>
                </Flex>
              </Card>

              <Flex gap="12px" style={{ marginBottom: 14 }}>
                <InputGroup style={{ flex: 1 }}>
                  <Label>Date</Label>
                  <Input type="date" value={filters.date} readOnly />
                </InputGroup>
              </Flex>
              <Flex gap="12px" style={{ marginBottom: 20 }}>
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

              <Flex gap="6px" style={{ marginBottom: 16, padding: '10px 12px', background:'rgba(245,158,11,0.08)', borderRadius:8, border:'1px solid rgba(245,158,11,0.2)' }}>
                <MdInfoOutline color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                <Text size="12px" muted>
                  You have a <strong style={{ color:'#f59e0b' }}>15-min grace period</strong> to mark arrival after start time, or booking auto-cancels.
                </Text>
              </Flex>

              <Flex gap="10px">
                <Button variant="ghost" fullWidth onClick={() => setSelectedSlot(null)}>Cancel</Button>
                <Button fullWidth onClick={handleBook} disabled={bookingLoading}>
                  {bookingLoading ? <Spinner size="16px" /> : '🎉 Confirm Booking'}
                </Button>
              </Flex>
            </ModalCard>
          </BookingModal>
        )}
      </AnimatePresence>
    </Layout>
  );
}
