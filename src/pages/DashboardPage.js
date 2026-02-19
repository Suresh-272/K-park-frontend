// src/pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import toast from 'react-hot-toast';
import { MdLocalParking, MdArrowForward, MdBookmark, MdCheckCircle } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, slotAPI, waitlistAPI } from '../services/api';
import {
  PageWrapper, PageHeader, Title, Text, Card, StatCard,
  Grid, Badge, Button, Flex, SectionTitle, EmptyState, Spinner
} from '../components/common/UI';
import Layout from '../components/common/Layout';

const SlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 7px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
    gap: 5px;
  }
`;

const SlotDot = styled(motion.div).withConfig({ shouldForwardProp: p => p !== "status" })`
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  border: 1px solid ${({ status }) =>
    status === 'available' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.3)'};
  background: ${({ status }) =>
    status === 'available' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.06)'};
  color: ${({ status }) => status === 'available' ? '#10b981' : '#ef4444'};
  cursor: ${({ status }) => status === 'available' ? 'pointer' : 'default'};
  transition: all 0.2s;
  text-align: center;
  padding: 2px;
  min-height: 44px;
  -webkit-tap-highlight-color: transparent;

  &:active { transform: ${({ status }) => status === 'available' ? 'scale(0.93)' : 'none'}; }
`;

const WelcomeBanner = styled(motion.div)`
  background: linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.07));
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 18px;
  padding: 22px 24px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '🅿️';
    position: absolute;
    right: 16px; top: 50%;
    transform: translateY(-50%);
    font-size: 4rem;
    opacity: 0.07;
    pointer-events: none;
  }

  @media (max-width: 480px) {
    padding: 18px;
    border-radius: 14px;
    &::after { font-size: 3rem; }
  }
`;

const BookingItem = styled(Card)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 8px;
  cursor: pointer;

  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
  &:active { transform: scale(0.99); }

  .icon-wrap {
    width: 40px; height: 40px;
    border-radius: 10px;
    background: rgba(59,130,246,0.1);
    display: flex; align-items: center; justify-content: center;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 18px;
    flex-shrink: 0;
  }
  .info { flex: 1; min-width: 0; }
  .slot-name { font-weight: 700; font-size: 14px; }
  .meta { font-size: 11px; color: ${({ theme }) => theme.colors.textSecondary}; margin-top: 2px; }
`;

const QuickBtns = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;

  button { flex: 1; min-width: 120px; }

  @media (max-width: 360px) { button { min-width: 100px; font-size: 13px; } }
`;

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      slotAPI.getAll(),
      bookingAPI.getMy({ status: 'active' }),
      waitlistAPI.getMy(),
    ]).then(([slotsRes, bookingsRes, waitlistRes]) => {
      setSlots(slotsRes.data.data);
      setMyBookings(bookingsRes.data.data.slice(0, 5));
      setWaitlist(waitlistRes.data.data.filter(w => w.status === 'waiting' || w.status === 'notified'));
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const totalSlots = slots.length;
  const availableCount = slots.filter(s => s.status === 'available').length;
  const bookedCount = totalSlots - availableCount;

  const handleMarkArrival = async (bookingId, e) => {
    e.stopPropagation();
    try {
      await bookingAPI.markArrival(bookingId);
      toast.success('Arrival marked! ✅');
      setMyBookings(prev => prev.map(b => b._id === bookingId ? { ...b, arrivedAt: new Date() } : b));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';

  if (loading) return (
    <Layout>
      <Flex justify="center" style={{ padding: 80 }}><Spinner size="40px" /></Flex>
    </Layout>
  );

  return (
    <Layout>
      <PageWrapper variants={container} initial="hidden" animate="show">
        {/* Welcome */}
        <WelcomeBanner variants={item}>
          <Text muted size="12px" style={{ textTransform:'uppercase', letterSpacing:'0.1em', marginBottom: 4 }}>
            {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
          </Text>
          <Title size="1.4rem">Good {greeting}, {user?.name?.split(' ')[0]} 👋</Title>
          <Text muted size="13px" style={{ marginTop: 5 }}>
            {availableCount > 0
              ? `${availableCount} slots available right now.`
              : 'All slots booked. Join the waitlist!'}
          </Text>
          <QuickBtns>
            <Button onClick={() => navigate('/slots')}><MdLocalParking />Find Parking</Button>
            <Button variant="ghost" onClick={() => navigate('/bookings')}><MdBookmark />My Bookings</Button>
          </QuickBtns>
        </WelcomeBanner>

        {/* Stats — 2x2 on mobile */}
        <motion.div variants={item}>
          <Grid cols="repeat(4, 1fr)" mobileCols="1fr 1fr" gap="12px" mobileGap="8px" style={{ marginBottom: 20 }}>
            <StatCard color="#10b981">
              <div className="stat-label">Available</div>
              <div className="stat-value"><CountUp end={availableCount} duration={1.2} /></div>
              <div className="stat-sub">of {totalSlots} total</div>
            </StatCard>
            <StatCard color="#3b82f6">
              <div className="stat-label">My Bookings</div>
              <div className="stat-value"><CountUp end={myBookings.length} duration={1.2} /></div>
              <div className="stat-sub">active</div>
            </StatCard>
            <StatCard color="#f59e0b">
              <div className="stat-label">Waitlist</div>
              <div className="stat-value"><CountUp end={waitlist.length} duration={1.2} /></div>
              <div className="stat-sub">pending</div>
            </StatCard>
            <StatCard color="#ef4444">
              <div className="stat-label">Occupied</div>
              <div className="stat-value"><CountUp end={bookedCount} duration={1.2} /></div>
              <div className="stat-sub">slots</div>
            </StatCard>
          </Grid>
        </motion.div>

        {/* Waitlist alert */}
        {waitlist.filter(w => w.status === 'notified').length > 0 && (
          <motion.div variants={item} style={{ marginBottom: 16 }}>
            <Card style={{ border:'1px solid rgba(6,182,212,0.35)', background:'rgba(6,182,212,0.05)' }}>
              <Flex gap="12px">
                <div style={{ fontSize: 26, flexShrink: 0 }}>🟢</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontWeight: 700, fontSize: 14 }}>A slot is ready for you!</Text>
                  <Text muted size="12px">Confirm quickly before the 10-min window expires.</Text>
                  <Button variant="accent" size="sm" style={{ marginTop: 10 }} onClick={() => navigate('/waitlist')}>
                    Confirm Now <MdArrowForward />
                  </Button>
                </div>
              </Flex>
            </Card>
          </motion.div>
        )}

        {/* Live Slot Map */}
        <motion.div variants={item} style={{ marginBottom: 20 }}>
          <Card>
            <Flex justify="space-between" align="center" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <Title size="1rem">Live Slot Map</Title>
                <Text muted size="11px">Tap available slot to book</Text>
              </div>
              <Flex gap="10px">
                <Flex gap="5px"><div style={{ width:10, height:10, borderRadius:3, background:'rgba(16,185,129,0.3)', border:'1px solid rgba(16,185,129,0.5)', flexShrink:0 }} /><Text muted size="11px">Free</Text></Flex>
                <Flex gap="5px"><div style={{ width:10, height:10, borderRadius:3, background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.4)', flexShrink:0 }} /><Text muted size="11px">Taken</Text></Flex>
              </Flex>
            </Flex>
            {slots.length === 0 ? (
              <EmptyState>
                <div className="icon">🅿️</div>
                <div className="title">No slots yet</div>
                <div className="desc">Admin needs to add parking slots.</div>
              </EmptyState>
            ) : (
              <SlotGrid>
                {slots.map((slot, i) => (
                  <SlotDot key={slot._id} status={slot.status}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.015 }}
                    onClick={() => slot.status === 'available' && navigate('/slots')}
                    title={`${slot.slotNumber} — ${slot.category}`}>
                    {slot.slotNumber}
                  </SlotDot>
                ))}
              </SlotGrid>
            )}
          </Card>
        </motion.div>

        {/* Active Bookings */}
        <motion.div variants={item}>
          <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
            <SectionTitle style={{ flex: 1, marginBottom: 0 }}>Active Bookings</SectionTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/bookings')}>
              All <MdArrowForward />
            </Button>
          </Flex>

          {myBookings.length === 0 ? (
            <EmptyState>
              <div className="icon"><MdBookmark /></div>
              <div className="title">No active bookings</div>
              <div className="desc">Book a slot from above.</div>
            </EmptyState>
          ) : (
            myBookings.map(booking => (
              <BookingItem key={booking._id} hoverable onClick={() => navigate('/bookings')}>
                <div className="icon-wrap"><MdLocalParking /></div>
                <div className="info">
                  <div className="slot-name">Slot {booking.slot?.slotNumber || '—'}</div>
                  <div className="meta">{booking.bookingDate} · {booking.startTime}–{booking.endTime}</div>
                </div>
                <Flex gap="6px" direction="column" align="flex-end">
                  <Badge status={booking.status}>{booking.status}</Badge>
                  {!booking.arrivedAt && (
                    <Button size="sm" variant="success"
                      onClick={e => handleMarkArrival(booking._id, e)}>
                      <MdCheckCircle /> Arrived
                    </Button>
                  )}
                </Flex>
              </BookingItem>
            ))
          )}
        </motion.div>
      </PageWrapper>
    </Layout>
  );
}