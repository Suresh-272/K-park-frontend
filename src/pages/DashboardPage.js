// src/pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import toast from 'react-hot-toast';
import {
  MdLocalParking, MdCheckCircle, MdCancel, MdQueue,
  MdArrowForward, MdAccessTime, MdBookmark, MdTrendingUp
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, slotAPI, waitlistAPI } from '../services/api';
import {
  PageWrapper, PageHeader, Title, Text, Card, StatCard,
  Grid, Badge, Button, Flex, SectionTitle, EmptyState, Spinner
} from '../components/common/UI';
import Layout from '../components/common/Layout';

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const SlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 8px;
`;

const SlotDot = styled(motion.div)`
  aspect-ratio: 1;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  border: 1px solid ${({ status, theme }) =>
    status === 'available' ? 'rgba(16,185,129,0.4)' :
    status === 'booked' ? 'rgba(239,68,68,0.4)' : 'rgba(71,85,105,0.3)'};
  background: ${({ status }) =>
    status === 'available' ? 'rgba(16,185,129,0.08)' :
    status === 'booked' ? 'rgba(239,68,68,0.08)' : 'rgba(71,85,105,0.08)'};
  color: ${({ status }) =>
    status === 'available' ? '#10b981' :
    status === 'booked' ? '#ef4444' : '#64748b'};
  cursor: ${({ status }) => status === 'available' ? 'pointer' : 'default'};
  transition: all 0.2s;
  letter-spacing: 0.05em;

  &:hover {
    transform: ${({ status }) => status === 'available' ? 'scale(1.08)' : 'none'};
    box-shadow: ${({ status }) => status === 'available' ? '0 4px 16px rgba(16,185,129,0.3)' : 'none'};
  }
`;

const BookingCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateX(4px);
  }

  .icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(59,130,246,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 20px;
    flex-shrink: 0;
  }

  .info { flex: 1; min-width: 0; }
  .slot-name { font-weight: 700; font-size: 15px; }
  .meta { font-size: 12px; color: ${({ theme }) => theme.colors.textSecondary}; margin-top: 2px; }
`;

const WelcomeBanner = styled(motion.div)`
  background: linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(6,182,212,0.08) 100%);
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 28px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '🅿️';
    position: absolute;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 5rem;
    opacity: 0.08;
  }
`;

const QuickActionBtn = styled(Button)`
  flex: 1;
  min-width: 140px;
`;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

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
  const availableCount = slots.filter(s => {
    // simple: no bookingDate filter for now, just show slot.status
    return s.status === 'available';
  }).length;
  const bookedCount = totalSlots - availableCount;

  const handleMarkArrival = async (bookingId) => {
    try {
      await bookingAPI.markArrival(bookingId);
      toast.success('Arrival marked! ✅');
      setMyBookings(prev => prev.map(b => b._id === bookingId ? { ...b, arrivedAt: new Date() } : b));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <Layout><div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size="40px" /></div></Layout>;

  return (
    <Layout>
      <PageWrapper variants={container} initial="hidden" animate="show">
        {/* Welcome */}
        <WelcomeBanner variants={item}>
          <Text muted size="13px" style={{ textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          <Title size="1.6rem">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋</Title>
          <Text muted size="14px" style={{ marginTop: 6 }}>
            {availableCount > 0
              ? `${availableCount} parking slots available right now.`
              : 'All slots are currently booked. Join the waitlist!'}
          </Text>
          <Flex gap="12px" style={{ marginTop: 20, flexWrap: 'wrap' }}>
            <QuickActionBtn onClick={() => navigate('/slots')}>
              <MdLocalParking /> Find Parking
            </QuickActionBtn>
            <QuickActionBtn variant="ghost" onClick={() => navigate('/bookings')}>
              <MdBookmark /> My Bookings
            </QuickActionBtn>
          </Flex>
        </WelcomeBanner>

        {/* Stats */}
        <motion.div variants={item}>
          <Grid cols="repeat(auto-fill, minmax(200px, 1fr))" gap="16px" style={{ marginBottom: 28 }}>
            <StatCard color="#10b981">
              <div className="stat-label">Available Slots</div>
              <div className="stat-value"><CountUp end={availableCount} duration={1.5} /></div>
              <div className="stat-sub">of {totalSlots} total slots</div>
            </StatCard>
            <StatCard color="#3b82f6">
              <div className="stat-label">My Active Bookings</div>
              <div className="stat-value"><CountUp end={myBookings.length} duration={1.5} /></div>
              <div className="stat-sub">currently active</div>
            </StatCard>
            <StatCard color="#f59e0b">
              <div className="stat-label">Waitlist</div>
              <div className="stat-value"><CountUp end={waitlist.length} duration={1.5} /></div>
              <div className="stat-sub">pending entries</div>
            </StatCard>
            <StatCard color="#ef4444">
              <div className="stat-label">Booked Slots</div>
              <div className="stat-value"><CountUp end={bookedCount} duration={1.5} /></div>
              <div className="stat-sub">occupied now</div>
            </StatCard>
          </Grid>
        </motion.div>

        {/* Live Slot Map */}
        <motion.div variants={item} style={{ marginBottom: 28 }}>
          <Card>
            <Flex justify="space-between" style={{ marginBottom: 20 }}>
              <div>
                <Title size="1.1rem">Live Slot Map</Title>
                <Text muted size="12px">Click an available slot to book instantly</Text>
              </div>
              <Flex gap="12px">
                <Flex gap="6px"><SlotDot status="available" style={{ width:14, height:14 }} /><Text muted size="12px">Available</Text></Flex>
                <Flex gap="6px"><SlotDot status="booked" style={{ width:14, height:14 }} /><Text muted size="12px">Booked</Text></Flex>
              </Flex>
            </Flex>
            {slots.length === 0 ? (
              <EmptyState>
                <div className="icon">🅿️</div>
                <div className="title">No slots configured</div>
                <div className="desc">Ask admin to add parking slots.</div>
              </EmptyState>
            ) : (
              <SlotGrid>
                {slots.map((slot, i) => (
                  <SlotDot
                    key={slot._id}
                    status={slot.status}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => slot.status === 'available' && navigate('/slots')}
                    title={`${slot.slotNumber} — ${slot.category} — ${slot.slotType}`}
                  >
                    {slot.slotNumber}
                  </SlotDot>
                ))}
              </SlotGrid>
            )}
          </Card>
        </motion.div>

        {/* Active Bookings */}
        <motion.div variants={item}>
          <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
            <SectionTitle style={{ flex: 1 }}>Active Bookings</SectionTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/bookings')}>
              View All <MdArrowForward />
            </Button>
          </Flex>

          {myBookings.length === 0 ? (
            <EmptyState>
              <div className="icon"><MdBookmark /></div>
              <div className="title">No active bookings</div>
              <div className="desc">Book a slot from the parking map above.</div>
            </EmptyState>
          ) : (
            myBookings.map(booking => (
              <BookingCard key={booking._id} hoverable onClick={() => navigate('/bookings')}>
                <div className="icon-wrap"><MdLocalParking /></div>
                <div className="info">
                  <div className="slot-name">Slot {booking.slot?.slotNumber || '—'}</div>
                  <div className="meta">
                    {booking.bookingDate} · {booking.startTime} – {booking.endTime}
                  </div>
                </div>
                <Flex gap="8px" direction="column" align="flex-end">
                  <Badge status={booking.status}>{booking.status}</Badge>
                  {!booking.arrivedAt && (
                    <Button size="sm" variant="success"
                      onClick={e => { e.stopPropagation(); handleMarkArrival(booking._id); }}>
                      Mark Arrival
                    </Button>
                  )}
                </Flex>
              </BookingCard>
            ))
          )}
        </motion.div>

        {/* Waitlist Notifications */}
        {waitlist.filter(w => w.status === 'notified').length > 0 && (
          <motion.div variants={item} style={{ marginTop: 24 }}>
            <Card style={{ border: '1px solid rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.05)' }}>
              <Flex gap="12px">
                <div style={{ fontSize: 28 }}>🟢</div>
                <div>
                  <Text style={{ fontWeight: 700 }}>A slot is available for you!</Text>
                  <Text muted size="13px">You have been notified from the waitlist. Confirm quickly before the window expires.</Text>
                  <Button variant="accent" size="sm" style={{ marginTop: 12 }} onClick={() => navigate('/waitlist')}>
                    Confirm Now <MdArrowForward />
                  </Button>
                </div>
              </Flex>
            </Card>
          </motion.div>
        )}
      </PageWrapper>
    </Layout>
  );
}
