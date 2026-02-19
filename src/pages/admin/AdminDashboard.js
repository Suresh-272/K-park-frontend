// src/pages/admin/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import toast from 'react-hot-toast';
import {
  MdPeople, MdLocalParking, MdBookmark, MdQueue,
  MdTrendingUp, MdArrowForward, MdCalendarToday
} from 'react-icons/md';
import { adminAPI } from '../../services/api';
import {
  PageWrapper, PageHeader, Title, Text, StatCard, Card,
  Grid, Flex, Badge, Button, SectionTitle, Spinner, EmptyState
} from '../../components/common/UI';
import Layout from '../../components/common/Layout';
import { useNavigate } from 'react-router-dom';

const OccupancyBar = styled.div`
  height: 8px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 99px;
  overflow: hidden;
  margin-top: 8px;

  .fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, #3b82f6, #06b6d4);
    width: ${({ pct }) => pct}%;
    transition: width 1s ease;
  }
`;

const BreakdownRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child { border-bottom: none; }
`;

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    adminAPI.getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><Flex justify="center" style={{ padding: 80 }}><Spinner size="40px" /></Flex></Layout>;
  if (!data) return null;

  const occupancyPct = data.totalSlots > 0
    ? Math.round((data.activeBookingsToday / data.totalSlots) * 100) : 0;

  return (
    <Layout>
      <PageWrapper variants={container} initial="hidden" animate="show">
        <PageHeader>
          <div>
            <Title size="1.8rem" gradient>Admin Dashboard</Title>
            <Text muted size="14px" style={{ marginTop: 4 }}>
              Real-time parking system overview
            </Text>
          </div>
          <Flex gap="10px">
            <Button variant="ghost" onClick={() => navigate('/admin/users')}>
              <MdPeople /> Manage Users
            </Button>
            <Button onClick={() => navigate('/admin/bookings')}>
              <MdBookmark /> All Bookings
            </Button>
          </Flex>
        </PageHeader>

        {/* Stats Grid */}
        <motion.div variants={item}>
          <Grid cols="repeat(auto-fill, minmax(190px, 1fr))" gap="16px" style={{ marginBottom: 28 }}>
            <StatCard color="#3b82f6">
              <div className="stat-label">Total Users</div>
              <div className="stat-value"><CountUp end={data.totalUsers} duration={1.5} /></div>
              <div className="stat-sub">Active accounts</div>
            </StatCard>
            <StatCard color="#10b981">
              <div className="stat-label">Available Today</div>
              <div className="stat-value"><CountUp end={data.availableSlotsToday} duration={1.5} /></div>
              <div className="stat-sub">of {data.totalSlots} total</div>
            </StatCard>
            <StatCard color="#f59e0b">
              <div className="stat-label">Booked Today</div>
              <div className="stat-value"><CountUp end={data.activeBookingsToday} duration={1.5} /></div>
              <div className="stat-sub">active bookings</div>
            </StatCard>
            <StatCard color="#ef4444">
              <div className="stat-label">Waitlist Today</div>
              <div className="stat-value"><CountUp end={data.waitlistToday} duration={1.5} /></div>
              <div className="stat-sub">pending requests</div>
            </StatCard>
            <StatCard color="#a855f7">
              <div className="stat-label">Total Bookings</div>
              <div className="stat-value"><CountUp end={data.totalBookings} duration={1.5} /></div>
              <div className="stat-sub">all time</div>
            </StatCard>
            <StatCard color="#06b6d4">
              <div className="stat-label">Total Slots</div>
              <div className="stat-value"><CountUp end={data.totalSlots} duration={1.5} /></div>
              <div className="stat-sub">configured slots</div>
            </StatCard>
          </Grid>
        </motion.div>

        <Grid cols="1fr 1fr" gap="20px">
          {/* Occupancy */}
          <motion.div variants={item}>
            <Card>
              <Title size="1rem" style={{ marginBottom: 4 }}>Today's Occupancy</Title>
              <Text muted size="13px">Parking utilization rate</Text>
              <div style={{ margin: '20px 0' }}>
                <Flex justify="space-between" style={{ marginBottom: 4 }}>
                  <Text muted size="12px">{data.activeBookingsToday} booked</Text>
                  <Text style={{ fontWeight: 700, color: occupancyPct > 80 ? '#ef4444' : '#10b981' }}>
                    {occupancyPct}%
                  </Text>
                </Flex>
                <OccupancyBar pct={occupancyPct}>
                  <div className="fill" />
                </OccupancyBar>
              </div>
              <Flex gap="16px">
                <div>
                  <Text muted size="11px" style={{ textTransform:'uppercase', letterSpacing:'0.08em' }}>Available</Text>
                  <Text style={{ fontWeight: 700, color: '#10b981', fontSize: 20 }}>{data.availableSlotsToday}</Text>
                </div>
                <div>
                  <Text muted size="11px" style={{ textTransform:'uppercase', letterSpacing:'0.08em' }}>Occupied</Text>
                  <Text style={{ fontWeight: 700, color: '#ef4444', fontSize: 20 }}>{data.activeBookingsToday}</Text>
                </div>
                <div>
                  <Text muted size="11px" style={{ textTransform:'uppercase', letterSpacing:'0.08em' }}>Waitlist</Text>
                  <Text style={{ fontWeight: 700, color: '#f59e0b', fontSize: 20 }}>{data.waitlistToday}</Text>
                </div>
              </Flex>
            </Card>
          </motion.div>

          {/* Slot Breakdown */}
          <motion.div variants={item}>
            <Card>
              <Title size="1rem" style={{ marginBottom: 16 }}>Slot Breakdown</Title>
              {data.slotBreakdown?.length === 0 ? (
                <EmptyState>
                  <div className="desc">No slots configured yet.</div>
                </EmptyState>
              ) : (
                data.slotBreakdown?.map((group, i) => (
                  <BreakdownRow key={i}>
                    <Flex gap="8px">
                      <span>{group._id.slotType === 'two-wheeler' ? '🏍️' : '🚗'}</span>
                      <Text style={{ fontWeight: 500 }}>{group._id.slotType}</Text>
                      <Badge status={group._id.category}>{group._id.category}</Badge>
                    </Flex>
                    <Text style={{ fontWeight: 700, fontFamily: 'Orbitron, sans-serif' }}>
                      {group.count}
                    </Text>
                  </BreakdownRow>
                ))
              )}
            </Card>
          </motion.div>
        </Grid>

        {/* Quick Actions */}
        <motion.div variants={item} style={{ marginTop: 24 }}>
          <SectionTitle>Quick Actions</SectionTitle>
          <Grid cols="repeat(auto-fill, minmax(200px, 1fr))" gap="12px">
            {[
              { label: 'Manage Slots', icon: '🅿️', path: '/slots', variant: 'primary' },
              { label: 'View All Bookings', icon: '📋', path: '/admin/bookings', variant: 'ghost' },
              { label: 'User Management', icon: '👥', path: '/admin/users', variant: 'ghost' },
              { label: 'Waitlist Queue', icon: '⏳', path: '/waitlist', variant: 'ghost' },
            ].map(action => (
              <Button key={action.label} variant={action.variant} fullWidth
                onClick={() => navigate(action.path)}>
                {action.icon} {action.label} <MdArrowForward />
              </Button>
            ))}
          </Grid>
        </motion.div>
      </PageWrapper>
    </Layout>
  );
}
