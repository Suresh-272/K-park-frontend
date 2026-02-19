// src/pages/BookingsPage.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  MdLocalParking, MdCheckCircle, MdCancel, MdExtension,
  MdAccessTime, MdDirectionsCar, MdCalendarToday, MdFilterList
} from 'react-icons/md';
import { bookingAPI } from '../services/api';
import {
  PageWrapper, PageHeader, Title, Text, Card, Badge,
  Button, Flex, Grid, EmptyState, Spinner, Select, InputGroup, Label,
  GlassCard, SectionTitle
} from '../components/common/UI';
import Layout from '../components/common/Layout';

const BookingRow = styled(motion.div)`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 20px 24px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
  transition: border-color 0.2s, transform 0.2s;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    background: ${({ status }) =>
      status === 'active' ? '#10b981' :
      status === 'cancelled' ? '#ef4444' :
      status === 'expired' ? '#64748b' : '#3b82f6'};
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHover};
    transform: translateX(2px);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const SlotIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: ${({ status }) =>
    status === 'active' ? 'rgba(16,185,129,0.1)' :
    status === 'cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(71,85,105,0.1)'};
  flex-shrink: 0;
`;

const ExtendModal = styled(motion.div)`
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
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
`;

const TabBar = styled.div`
  display: flex;
  gap: 4px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 4px;
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const Tab = styled.button`
  flex: 1;
  min-width: 80px;
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
`;

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const rowAnim = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } };

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
      toast.success(`⏱️ Booking extended by ${extraMinutes} minutes!`);
      setExtending(null);
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot extend'); }
    finally { setActionLoading(''); }
  };

  const tabs = [
    { key: 'active', label: '🟢 Active' },
    { key: 'completed', label: '✅ Completed' },
    { key: 'cancelled', label: '❌ Cancelled' },
    { key: 'expired', label: '⏰ Expired' },
    { key: 'all', label: 'All' },
  ];

  return (
    <Layout>
      <PageWrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader>
          <div>
            <Title size="1.8rem">My Bookings</Title>
            <Text muted size="14px" style={{ marginTop: 4 }}>Manage your parking reservations</Text>
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
              <BookingRow key={booking._id} status={booking.status} variants={rowAnim} style={{ marginBottom: 12 }}>
                <SlotIcon status={booking.status}>
                  {booking.slot?.slotType === 'two-wheeler' ? '🏍️' : '🚗'}
                </SlotIcon>

                <div>
                  <Flex gap="10px" align="center" style={{ marginBottom: 6 }}>
                    <Text style={{ fontWeight: 700, fontSize: 16 }}>
                      Slot {booking.slot?.slotNumber || '—'}
                    </Text>
                    <Badge status={booking.status}>{booking.status}</Badge>
                    <Badge status={booking.slot?.category}>{booking.slot?.category}</Badge>
                    {booking.isExtended && <Badge status="notified">Extended</Badge>}
                  </Flex>
                  <Flex gap="16px" wrap="wrap">
                    <Flex gap="6px" align="center">
                      <MdCalendarToday color="#64748b" size={13} />
                      <Text muted size="13px">{booking.bookingDate}</Text>
                    </Flex>
                    <Flex gap="6px" align="center">
                      <MdAccessTime color="#64748b" size={13} />
                      <Text muted size="13px">{booking.startTime} – {booking.endTime}</Text>
                    </Flex>
                    <Flex gap="6px" align="center">
                      <MdDirectionsCar color="#64748b" size={13} />
                      <Text muted size="13px">{booking.user?.vehicleNumber}</Text>
                    </Flex>
                  </Flex>
                  {booking.arrivedAt && (
                    <Text size="12px" style={{ color: '#10b981', marginTop: 4 }}>
                      ✅ Arrived at {new Date(booking.arrivedAt).toLocaleTimeString()}
                    </Text>
                  )}
                  {booking.extensionCount > 0 && (
                    <Text muted size="12px" style={{ marginTop: 2 }}>
                      Extensions used: {booking.extensionCount}/2
                    </Text>
                  )}
                </div>

                {booking.status === 'active' && (
                  <Flex gap="8px" direction="column" align="flex-end">
                    {!booking.arrivedAt && (
                      <Button size="sm" variant="success"
                        disabled={actionLoading === booking._id + '_arrival'}
                        onClick={() => handleMarkArrival(booking._id)}>
                        {actionLoading === booking._id + '_arrival'
                          ? <Spinner size="14px" /> : <><MdCheckCircle /> Arrived</>}
                      </Button>
                    )}
                    {booking.extensionCount < 2 && (
                      <Button size="sm" variant="warning"
                        onClick={() => setExtending(booking)}>
                        <MdExtension /> Extend
                      </Button>
                    )}
                    <Button size="sm" variant="danger"
                      disabled={actionLoading === booking._id + '_cancel'}
                      onClick={() => handleCancel(booking._id)}>
                      {actionLoading === booking._id + '_cancel'
                        ? <Spinner size="14px" /> : <><MdCancel /> Cancel</>}
                    </Button>
                  </Flex>
                )}
              </BookingRow>
            ))}
          </motion.div>
        )}
      </PageWrapper>

      {/* Extend Modal */}
      <AnimatePresence>
        {extending && (
          <ExtendModal>
            <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setExtending(null)} />
            <GlassCard as={motion.div}
              style={{ position:'relative', zIndex:1, width:'100%', maxWidth:380, border:'1px solid rgba(245,158,11,0.3)' }}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Title size="1.1rem" style={{ marginBottom: 6 }}>Extend Booking</Title>
              <Text muted size="13px" style={{ marginBottom: 20 }}>
                Slot {extending.slot?.slotNumber} · Current end: {extending.endTime}
                &nbsp;· Extension {extending.extensionCount + 1}/2
              </Text>
              <InputGroup style={{ marginBottom: 20 }}>
                <Label>Extra Minutes</Label>
                <Select value={extraMinutes} onChange={e => setExtraMinutes(e.target.value)}>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </Select>
              </InputGroup>
              <Flex gap="10px">
                <Button variant="ghost" fullWidth onClick={() => setExtending(null)}>Cancel</Button>
                <Button variant="warning" fullWidth onClick={handleExtend}
                  disabled={!!actionLoading}>
                  {actionLoading ? <Spinner size="16px" /> : '⏱️ Extend'}
                </Button>
              </Flex>
            </GlassCard>
          </ExtendModal>
        )}
      </AnimatePresence>
    </Layout>
  );
}
