// src/pages/admin/AdminBookings.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdBookmark, MdWarning, MdCalendarToday, MdAccessTime } from 'react-icons/md';
import { bookingAPI, adminAPI } from '../../services/api';
import {
  PageWrapper, PageHeader, Title, Text, Card, Badge, Button,
  Flex, Input, Select, InputGroup, Label, EmptyState, Spinner, Grid
} from '../../components/common/UI';
import Layout from '../../components/common/Layout';

const BookingCard = styled(Card)`
  padding: 14px 16px;
  margin-bottom: 10px;
  border-radius: 12px;
  border-left: 4px solid ${({ status }) =>
    status === 'active' ? '#10b981' : status === 'cancelled' ? '#ef4444' : '#334155'};
`;

const MetaRow = styled.div`
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 3px;
`;

const FilterRow = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px;
  > * { flex: 1 1 140px; min-width: 0; }
  @media (max-width: 480px) { > * { flex: 1 1 calc(50% - 5px); } }
`;

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status:'', date:'' });
  const [overriding, setOverriding] = useState('');

  useEffect(() => { fetchBookings(); }, [filters]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.date) params.date = filters.date;
      const res = await bookingAPI.getAll(params);
      setBookings(res.data.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleOverride = async (id) => {
    if (!window.confirm('Force cancel this booking?')) return;
    setOverriding(id);
    try {
      await adminAPI.overrideBooking(id, { action:'cancel', reason:'Admin override' });
      toast.success('Booking cancelled by admin.');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Override failed'); }
    finally { setOverriding(''); }
  };

  return (
    <Layout>
      <PageWrapper initial={{ opacity:0 }} animate={{ opacity:1 }}>
        <PageHeader>
          <div>
            <Title size="1.6rem">All Bookings</Title>
            <Text muted size="13px" style={{ marginTop:3 }}>{bookings.length} bookings</Text>
          </div>
        </PageHeader>

        <FilterRow>
          <InputGroup>
            <Label>Date</Label>
            <Input type="date" value={filters.date}
              onChange={e => setFilters({...filters, date:e.target.value})} />
          </InputGroup>
          <InputGroup>
            <Label>Status</Label>
            <Select value={filters.status} onChange={e => setFilters({...filters, status:e.target.value})}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
              <option value="completed">Completed</option>
            </Select>
          </InputGroup>
          {(filters.status || filters.date) && (
            <Button variant="ghost" size="sm" style={{ alignSelf:'flex-end' }}
              onClick={() => setFilters({ status:'', date:'' })}>Clear</Button>
          )}
        </FilterRow>

        {loading ? (
          <Flex justify="center" style={{ padding:60 }}><Spinner size="40px" /></Flex>
        ) : bookings.length === 0 ? (
          <EmptyState>
            <div className="icon"><MdBookmark /></div>
            <div className="title">No bookings found</div>
          </EmptyState>
        ) : (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
            {bookings.map(b => (
              <BookingCard key={b._id} status={b.status}>
                <Flex justify="space-between" align="flex-start" gap="10px">
                  <div style={{ flex:1, minWidth:0 }}>
                    <Flex gap="8px" align="center" wrap="wrap" style={{ marginBottom:6 }}>
                      <Text style={{ fontWeight:700, fontSize:15 }}>
                        {b.slot?.slotType==='two-wheeler'?'🏍️':'🚗'} Slot {b.slot?.slotNumber}
                      </Text>
                      <Badge status={b.status}>{b.status}</Badge>
                      <Badge status={b.slot?.category}>{b.slot?.category}</Badge>
                    </Flex>
                    <Text style={{ fontWeight:600, fontSize:13 }}>{b.user?.name}</Text>
                    <Text muted size="11px" style={{ marginBottom:3 }}>{b.user?.email}</Text>
                    <MetaRow><MdCalendarToday size={11} />{b.bookingDate}</MetaRow>
                    <MetaRow><MdAccessTime size={11} />{b.startTime}–{b.endTime}</MetaRow>
                    {b.arrivedAt && (
                      <Text size="11px" style={{ color:'#10b981', marginTop:3 }}>
                        ✅ Arrived {new Date(b.arrivedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                      </Text>
                    )}
                    <Text muted size="11px" style={{ marginTop:2 }}>Extensions: {b.extensionCount}/2</Text>
                  </div>
                  {b.status === 'active' && (
                    <Button size="sm" variant="danger"
                      disabled={overriding === b._id}
                      onClick={() => handleOverride(b._id)}
                      style={{ flexShrink:0 }}>
                      {overriding === b._id ? <Spinner size="13px" /> : <><MdWarning /> Override</>}
                    </Button>
                  )}
                </Flex>
              </BookingCard>
            ))}
          </motion.div>
        )}
      </PageWrapper>
    </Layout>
  );
}
