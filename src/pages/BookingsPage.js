// src/pages/BookingsPage.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdLocalParking, MdCheckCircle, MdCancel, MdExtension, MdAccessTime, MdCalendarToday, MdClose } from 'react-icons/md';
import { bookingAPI } from '../services/api';
import {
  PageWrapper, PageHeader, Title, Text, Card, Badge, Button,
  Flex, EmptyState, Spinner, Select, InputGroup, Label,
  ModalBackdrop, ModalSheet
} from '../components/common/UI';
import Layout from '../components/common/Layout';

const TabBar = styled.div`
  display: flex;
  gap: 4px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 4px;
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: 18px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Tab = styled.button.withConfig({ shouldForwardProp: p => p !== "active" })`
  flex-shrink: 0;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: ${({ theme }) => theme.fonts.body};
  background: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? '#fff' : theme.colors.textSecondary};
  min-height: 38px;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
`;

const BookingCard = styled(Card).withConfig({ shouldForwardProp: p => p !== "status" })`
  padding: 14px 16px;
  margin-bottom: 10px;
  border-left: 4px solid ${({ status }) =>
    status === 'active' ? '#10b981' : status === 'cancelled' ? '#ef4444' : '#334155'};
  border-radius: 12px;

  &:active { transform: scale(0.99); }
`;

const BookingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: start;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
  flex-wrap: wrap;
`;

const ActionBtns = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  flex-shrink: 0;
`;

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const rowAnim = { hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } };

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [extending, setExtending] = useState(null);
  const [extraMinutes, setExtraMinutes] = useState(60);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => { fetchBookings(); }, [activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const res = await bookingAPI.getMy(params);
      setBookings(res.data.data);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const handleMarkArrival = async (id) => {
    setActionLoading(id + '_arrival');
    try {
      await bookingAPI.markArrival(id);
      toast.success('✅ Arrival marked!');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(''); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setActionLoading(id + '_cancel');
    try {
      await bookingAPI.cancel(id, { reason: 'User cancelled' });
      toast.success('Booking cancelled.');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(''); }
  };

  const handleExtend = async () => {
    if (!extending) return;
    setActionLoading(extending._id + '_extend');
    try {
      await bookingAPI.extend(extending._id, { extraMinutes: Number(extraMinutes) });
      toast.success(`⏱️ Extended by ${extraMinutes} min!`);
      setExtending(null);
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot extend'); }
    finally { setActionLoading(''); }
  };

  const tabs = [
    { key: 'active', label: '🟢 Active' },
    { key: 'completed', label: '✅ Done' },
    { key: 'cancelled', label: '❌ Cancelled' },
    { key: 'expired', label: '⏰ Expired' },
    { key: 'all', label: 'All' },
  ];

  return (
    <Layout>
      <PageWrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader>
          <div>
            <Title size="1.6rem">My Bookings</Title>
            <Text muted size="13px" style={{ marginTop: 3 }}>Manage your reservations</Text>
          </div>
        </PageHeader>

        <TabBar>
          {tabs.map(t => (
            <Tab key={t.key} active={activeTab === t.key} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </Tab>
          ))}
        </TabBar>

        {loading ? (
          <Flex justify="center" style={{ padding: 60 }}><Spinner size="40px" /></Flex>
        ) : bookings.length === 0 ? (
          <EmptyState>
            <div className="icon"><MdLocalParking /></div>
            <div className="title">No {activeTab !== 'all' ? activeTab : ''} bookings</div>
            <div className="desc">Book a parking slot from the Slots page.</div>
          </EmptyState>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show">
            {bookings.map(booking => (
              <BookingCard key={booking._id} status={booking.status} variants={rowAnim}>
                <BookingGrid>
                  <div>
                    <Flex gap="8px" align="center" wrap="wrap" style={{ marginBottom: 6 }}>
                      <Text style={{ fontWeight: 700, fontSize: 15 }}>
                        {booking.slot?.slotType === 'two-wheeler' ? '🏍️' : '🚗'} Slot {booking.slot?.slotNumber || '—'}
                      </Text>
                      <Badge status={booking.status}>{booking.status}</Badge>
                    </Flex>
                    <MetaRow>
                      <MdCalendarToday size={12} />{booking.bookingDate}
                    </MetaRow>
                    <MetaRow>
                      <MdAccessTime size={12} />{booking.startTime} – {booking.endTime}
                    </MetaRow>
                    {booking.arrivedAt && (
                      <Text size="11px" style={{ color:'#10b981', marginTop: 4 }}>
                        ✅ Arrived {new Date(booking.arrivedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                      </Text>
                    )}
                    {booking.extensionCount > 0 && (
                      <Text muted size="11px">Extensions: {booking.extensionCount}/2</Text>
                    )}
                  </div>

                  {booking.status === 'active' && (
                    <ActionBtns>
                      {!booking.arrivedAt && (
                        <Button size="sm" variant="success"
                          disabled={actionLoading === booking._id + '_arrival'}
                          onClick={() => handleMarkArrival(booking._id)}>
                          {actionLoading === booking._id + '_arrival'
                            ? <Spinner size="13px" />
                            : <><MdCheckCircle /><span style={{display:'none'}}>Arrived</span></>}
                        </Button>
                      )}
                      {booking.extensionCount < 2 && (
                        <Button size="sm" variant="warning" onClick={() => setExtending(booking)}>
                          <MdExtension />
                        </Button>
                      )}
                      <Button size="sm" variant="danger"
                        disabled={actionLoading === booking._id + '_cancel'}
                        onClick={() => handleCancel(booking._id)}>
                        {actionLoading === booking._id + '_cancel'
                          ? <Spinner size="13px" /> : <MdCancel />}
                      </Button>
                    </ActionBtns>
                  )}
                </BookingGrid>

                {/* Action labels on mobile for active bookings */}
                {booking.status === 'active' && (
                  <Flex gap="6px" style={{ marginTop: 12, flexWrap: 'wrap' }}>
                    {!booking.arrivedAt && (
                      <Button size="sm" variant="success" style={{ flex:1 }}
                        disabled={actionLoading === booking._id + '_arrival'}
                        onClick={() => handleMarkArrival(booking._id)}>
                        {actionLoading === booking._id + '_arrival' ? <Spinner size="13px" /> : <><MdCheckCircle /> Mark Arrived</>}
                      </Button>
                    )}
                    {booking.extensionCount < 2 && (
                      <Button size="sm" variant="warning" style={{ flex:1 }} onClick={() => setExtending(booking)}>
                        <MdExtension /> Extend
                      </Button>
                    )}
                    <Button size="sm" variant="danger" style={{ flex:1 }}
                      disabled={actionLoading === booking._id + '_cancel'}
                      onClick={() => handleCancel(booking._id)}>
                      {actionLoading === booking._id + '_cancel' ? <Spinner size="13px" /> : <><MdCancel /> Cancel</>}
                    </Button>
                  </Flex>
                )}
              </BookingCard>
            ))}
          </motion.div>
        )}
      </PageWrapper>

      {/* Extend Modal */}
      <AnimatePresence>
        {extending && (
          <ModalBackdrop initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setExtending(null)}>
            <ModalSheet onClick={e => e.stopPropagation()}
              initial={{ opacity:0, y:60 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:60 }} maxWidth="360px">
              <Flex justify="space-between" align="center" style={{ marginBottom: 18 }}>
                <Title size="1.1rem">Extend Booking</Title>
                <button onClick={() => setExtending(null)}
                  style={{ background:'none', border:'none', color:'#64748b', fontSize:22, cursor:'pointer', padding:4, minHeight:44, display:'flex', alignItems:'center' }}>
                  <MdClose />
                </button>
              </Flex>
              <Text muted size="13px" style={{ marginBottom: 18 }}>
                Slot {extending.slot?.slotNumber} · Ends {extending.endTime} · Extension {extending.extensionCount + 1}/2
              </Text>
              <InputGroup style={{ marginBottom: 20 }}>
                <Label>Extra Time</Label>
                <Select value={extraMinutes} onChange={e => setExtraMinutes(e.target.value)}>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </Select>
              </InputGroup>
              <Flex gap="10px">
                <Button variant="ghost" fullWidth onClick={() => setExtending(null)}>Cancel</Button>
                <Button variant="warning" fullWidth onClick={handleExtend} disabled={!!actionLoading}>
                  {actionLoading ? <Spinner size="16px" /> : '⏱️ Extend'}
                </Button>
              </Flex>
            </ModalSheet>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </Layout>
  );
}