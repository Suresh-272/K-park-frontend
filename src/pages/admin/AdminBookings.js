// src/pages/admin/AdminBookings.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdBookmark, MdClose, MdSearch, MdWarning } from 'react-icons/md';
import { bookingAPI, adminAPI } from '../../services/api';
import {
  PageWrapper, PageHeader, Title, Text, Card, Badge,
  Button, Flex, Input, Select, InputGroup, Label,
  EmptyState, Spinner
} from '../../components/common/UI';
import Layout from '../../components/common/Layout';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 11px 14px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    white-space: nowrap;
  }

  td {
    padding: 12px 14px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    vertical-align: middle;
  }

  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(59,130,246,0.03); }
`;

const TableWrap = styled.div`
  overflow-x: auto;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', date: '' });
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
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const handleOverride = async (id) => {
    if (!window.confirm('Force cancel this booking? Waitlist will be triggered.')) return;
    setOverriding(id);
    try {
      await adminAPI.overrideBooking(id, { action: 'cancel', reason: 'Admin override' });
      toast.success('Booking cancelled by admin.');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Override failed'); }
    finally { setOverriding(''); }
  };

  return (
    <Layout>
      <PageWrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader>
          <div>
            <Title size="1.8rem">All Bookings</Title>
            <Text muted size="14px" style={{ marginTop: 4 }}>
              {bookings.length} bookings found
            </Text>
          </div>
        </PageHeader>

        <Card style={{ marginBottom: 20, padding: '16px 20px' }}>
          <Flex gap="12px" wrap="wrap">
            <InputGroup style={{ flex: '1 1 160px' }}>
              <Label>Date</Label>
              <Input type="date" value={filters.date}
                onChange={e => setFilters({ ...filters, date: e.target.value })} />
            </InputGroup>
            <InputGroup style={{ flex: '1 1 160px' }}>
              <Label>Status</Label>
              <Select value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
                <option value="completed">Completed</option>
              </Select>
            </InputGroup>
            <Button variant="ghost" style={{ alignSelf:'flex-end' }}
              onClick={() => setFilters({ status: '', date: '' })}>
              Clear
            </Button>
          </Flex>
        </Card>

        {loading ? (
          <Flex justify="center" style={{ padding: 60 }}><Spinner size="40px" /></Flex>
        ) : bookings.length === 0 ? (
          <EmptyState>
            <div className="icon"><MdBookmark /></div>
            <div className="title">No bookings found</div>
          </EmptyState>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Slot</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Arrived</th>
                    <th>Ext.</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id}>
                      <td>
                        <Text style={{ fontWeight: 600 }}>{b.user?.name}</Text>
                        <Text muted size="11px">{b.user?.email}</Text>
                        <Badge status={b.user?.role} style={{ marginTop:4, fontSize:10 }}>{b.user?.role}</Badge>
                      </td>
                      <td>
                        <Text style={{ fontWeight: 700 }}>{b.slot?.slotNumber}</Text>
                        <Text muted size="11px">{b.slot?.category} · {b.slot?.slotType}</Text>
                      </td>
                      <td><Text muted size="13px">{b.bookingDate}</Text></td>
                      <td>
                        <Text style={{ fontFamily:'monospace', fontSize:13 }}>
                          {b.startTime}–{b.endTime}
                        </Text>
                      </td>
                      <td><Badge status={b.status}>{b.status}</Badge></td>
                      <td>
                        {b.arrivedAt
                          ? <Text size="12px" style={{ color:'#10b981' }}>✅ {new Date(b.arrivedAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</Text>
                          : <Text muted size="12px">—</Text>}
                      </td>
                      <td>
                        <Text muted size="12px">{b.extensionCount}/2</Text>
                      </td>
                      <td>
                        {b.status === 'active' && (
                          <Button size="sm" variant="danger"
                            disabled={overriding === b._id}
                            onClick={() => handleOverride(b._id)}>
                            {overriding === b._id ? <Spinner size="12px" /> : <><MdWarning /> Override</>}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </motion.div>
        )}
      </PageWrapper>
    </Layout>
  );
}
