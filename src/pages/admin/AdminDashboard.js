// src/pages/admin/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import toast from 'react-hot-toast';
import { MdPeople, MdLocalParking, MdBookmark, MdArrowForward, MdAnalytics } from 'react-icons/md';
import { adminAPI } from '../../services/api';
import {
  PageWrapper, PageHeader, Title, Text, StatCard, Card,
  Grid, Flex, Badge, Button, SectionTitle, Spinner, EmptyState
} from '../../components/common/UI';
import Layout from '../../components/common/Layout';
import { useNavigate } from 'react-router-dom';

const OccupancyBar = styled.div.withConfig({ shouldForwardProp: p => p !== "pct" })`
  height: 8px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 99px;
  overflow: hidden;
  margin-top: 6px;
  .fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, #3b82f6, #06b6d4);
    width: ${({ pct }) => pct}%;
    transition: width 1.2s ease;
  }
`;

const BreakdownRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }
  @media (max-width: 480px) { flex-wrap: wrap; gap: 6px; }
`;

const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 20px;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const container = { hidden:{ opacity:0 }, show:{ opacity:1, transition:{ staggerChildren:0.07 } } };
const item = { hidden:{ opacity:0, y:14 }, show:{ opacity:1, y:0 } };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    adminAPI.getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><Flex justify="center" style={{ padding:80 }}><Spinner size="40px" /></Flex></Layout>;
  if (!data) return null;

  const pct = data.totalSlots > 0 ? Math.round((data.activeBookingsToday / data.totalSlots) * 100) : 0;

  return (
    <Layout>
      <PageWrapper variants={container} initial="hidden" animate="show">
        <PageHeader>
          <div>
            <Title size="1.6rem" gradient>Admin Dashboard</Title>
            <Text muted size="13px" style={{ marginTop:3 }}>Real-time parking overview</Text>
          </div>
          <Flex gap="8px" wrap="wrap">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
              <MdPeople /> Users
            </Button>
            <Button size="sm" onClick={() => navigate('/admin/slots')}>
              <MdLocalParking /> Slots
            </Button>
          </Flex>
        </PageHeader>

        <motion.div variants={item}>
          <Grid cols="repeat(3, 1fr)" mobileCols="1fr 1fr" gap="12px" mobileGap="8px" style={{ marginBottom:20 }}>
            <StatCard color="#10b981">
              <div className="stat-label">Available</div>
              <div className="stat-value"><CountUp end={data.availableSlotsToday} duration={1.2} /></div>
              <div className="stat-sub">of {data.totalSlots}</div>
            </StatCard>
            <StatCard color="#f59e0b">
              <div className="stat-label">Booked Today</div>
              <div className="stat-value"><CountUp end={data.activeBookingsToday} duration={1.2} /></div>
              <div className="stat-sub">active</div>
            </StatCard>
            <StatCard color="#ef4444" style={{ gridColumn:'span 1' }}>
              <div className="stat-label">Waitlist</div>
              <div className="stat-value"><CountUp end={data.waitlistToday} duration={1.2} /></div>
              <div className="stat-sub">today</div>
            </StatCard>
            <StatCard color="#3b82f6">
              <div className="stat-label">Total Users</div>
              <div className="stat-value"><CountUp end={data.totalUsers} duration={1.2} /></div>
              <div className="stat-sub">accounts</div>
            </StatCard>
            <StatCard color="#a855f7">
              <div className="stat-label">All Bookings</div>
              <div className="stat-value"><CountUp end={data.totalBookings} duration={1.2} /></div>
              <div className="stat-sub">all time</div>
            </StatCard>
            <StatCard color="#06b6d4">
              <div className="stat-label">Total Slots</div>
              <div className="stat-value"><CountUp end={data.totalSlots} duration={1.2} /></div>
              <div className="stat-sub">configured</div>
            </StatCard>
          </Grid>
        </motion.div>

        <TwoColGrid>
          <motion.div variants={item}>
            <Card>
              <Title size="1rem" style={{ marginBottom:3 }}>Occupancy Today</Title>
              <Text muted size="12px">Utilization rate</Text>
              <Flex justify="space-between" style={{ marginTop:14, marginBottom:4 }}>
                <Text muted size="12px">{data.activeBookingsToday}/{data.totalSlots} occupied</Text>
                <Text style={{ fontWeight:800, color: pct>80?'#ef4444':'#10b981', fontFamily:'Orbitron,sans-serif' }}>{pct}%</Text>
              </Flex>
              <OccupancyBar pct={pct}><div className="fill" /></OccupancyBar>
              <Flex gap="16px" style={{ marginTop:14 }}>
                <div>
                  <Text muted size="10px" style={{ textTransform:'uppercase' }}>Free</Text>
                  <Text style={{ fontWeight:800, color:'#10b981', fontSize:18 }}>{data.availableSlotsToday}</Text>
                </div>
                <div>
                  <Text muted size="10px" style={{ textTransform:'uppercase' }}>Used</Text>
                  <Text style={{ fontWeight:800, color:'#ef4444', fontSize:18 }}>{data.activeBookingsToday}</Text>
                </div>
                <div>
                  <Text muted size="10px" style={{ textTransform:'uppercase' }}>Queue</Text>
                  <Text style={{ fontWeight:800, color:'#f59e0b', fontSize:18 }}>{data.waitlistToday}</Text>
                </div>
              </Flex>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card>
              <Title size="1rem" style={{ marginBottom:14 }}>Slot Breakdown</Title>
              {!data.slotBreakdown?.length ? (
                <Text muted size="13px">No slots yet.</Text>
              ) : (
                data.slotBreakdown.map((g, i) => (
                  <BreakdownRow key={i}>
                    <Flex gap="7px" align="center">
                      <span>{g._id.slotType==='two-wheeler'?'🏍️':'🚗'}</span>
                      <Text style={{ fontSize:13 }}>{g._id.slotType}</Text>
                      <Badge status={g._id.category}>{g._id.category}</Badge>
                    </Flex>
                    <Text style={{ fontWeight:800, fontFamily:'Orbitron,sans-serif', fontSize:15 }}>{g.count}</Text>
                  </BreakdownRow>
                ))
              )}
            </Card>
          </motion.div>
        </TwoColGrid>

        <motion.div variants={item} style={{ marginTop:20 }}>
          <SectionTitle>Quick Actions</SectionTitle>
          <Grid cols="repeat(2, 1fr)" mobileCols="1fr 1fr" gap="10px">
            {[
              { label:'Manage Slots', icon:'🅿️', path:'/admin/slots', variant:'primary' },
              { label:'All Bookings', icon:'📋', path:'/admin/bookings', variant:'ghost' },
              { label:'Users', icon:'👥', path:'/admin/users', variant:'ghost' },
              { label:'Waitlist', icon:'⏳', path:'/waitlist', variant:'ghost' },
            ].map(a => (
              <Button key={a.label} variant={a.variant} fullWidth onClick={() => navigate(a.path)}>
                {a.icon} {a.label}
              </Button>
            ))}
          </Grid>
        </motion.div>
      </PageWrapper>
    </Layout>
  );
}