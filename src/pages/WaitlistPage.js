// src/pages/WaitlistPage.js
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdQueue, MdNotifications, MdDelete, MdCheckCircle, MdAdd, MdClose } from 'react-icons/md';
import { waitlistAPI } from '../services/api';
import {
  PageWrapper, PageHeader, Title, Text, Card, GlassCard,
  Badge, Button, Flex, InputGroup, Label, Input, Select,
  EmptyState, Spinner
} from '../components/common/UI';
import Layout from '../components/common/Layout';

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(6,182,212,0.4); }
  50% { box-shadow: 0 0 0 12px rgba(6,182,212,0); }
`;

const NotifiedCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(6,182,212,0.1), rgba(59,130,246,0.08));
  border: 1px solid rgba(6,182,212,0.4);
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 24px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #06b6d4, #3b82f6, #06b6d4);
    background-size: 200%;
    animation: shimmer 2s linear infinite;
  }

  .pulse-dot {
    width: 12px; height: 12px;
    background: #06b6d4;
    border-radius: 50%;
    animation: ${pulse} 1.5s ease-out infinite;
  }
`;

const WaitlistItem = styled(motion.div)`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
  transition: border-color 0.2s;

  &:hover { border-color: ${({ theme }) => theme.colors.borderHover}; }

  .position {
    width: 40px; height: 40px;
    background: rgba(59,130,246,0.1);
    border: 1px solid rgba(59,130,246,0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${({ theme }) => theme.fonts.display};
    font-weight: 700;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
  }
`;

const JoinModal = styled(motion.div)`
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

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJoin, setShowJoin] = useState(false);
  const [joinForm, setJoinForm] = useState({
    bookingDate: new Date().toISOString().split('T')[0],
    preferredStartTime: '09:00',
    preferredEndTime: '17:00',
    slotType: 'four-wheeler',
  });
  const [joining, setJoining] = useState(false);
  const [confirming, setConfirming] = useState('');
  const [leaving, setLeaving] = useState('');

  useEffect(() => { fetchWaitlist(); }, []);

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const res = await waitlistAPI.getMy();
      setWaitlist(res.data.data);
    } catch { toast.error('Failed to load waitlist'); }
    finally { setLoading(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoining(true);
    try {
      await waitlistAPI.join(joinForm);
      toast.success("📋 You're on the waitlist! We'll notify you via WhatsApp.");
      setShowJoin(false);
      fetchWaitlist();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to join'); }
    finally { setJoining(false); }
  };

  const handleConfirm = async (id) => {
    setConfirming(id);
    try {
      await waitlistAPI.confirm(id);
      toast.success('🎉 Slot confirmed! Booking created. Check WhatsApp!');
      fetchWaitlist();
    } catch (err) { toast.error(err.response?.data?.message || 'Confirmation failed'); }
    finally { setConfirming(''); }
  };

  const handleLeave = async (id) => {
    if (!window.confirm('Leave waitlist?')) return;
    setLeaving(id);
    try {
      await waitlistAPI.leave(id);
      toast.success('Removed from waitlist.');
      fetchWaitlist();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLeaving(''); }
  };

  const notified = waitlist.filter(w => w.status === 'notified');
  const waiting = waitlist.filter(w => w.status === 'waiting');
  const past = waitlist.filter(w => w.status === 'expired' || w.status === 'booked');

  return (
    <Layout>
      <PageWrapper variants={container} initial="hidden" animate="show">
        <PageHeader>
          <div>
            <Title size="1.8rem">Waitlist</Title>
            <Text muted size="14px" style={{ marginTop: 4 }}>
              Get notified when a slot becomes available
            </Text>
          </div>
          <Button onClick={() => setShowJoin(true)}>
            <MdAdd /> Join Waitlist
          </Button>
        </PageHeader>

        {/* Notified Alert */}
        <AnimatePresence>
          {notified.map(entry => (
            <NotifiedCard key={entry._id}
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Flex gap="16px" align="flex-start">
                <div className="pulse-dot" style={{ marginTop: 6, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Flex gap="10px" align="center" style={{ marginBottom: 8 }}>
                    <Text style={{ fontWeight: 700, fontSize: 16 }}>🟢 A slot is available for you!</Text>
                    <Badge status="notified">ACTION REQUIRED</Badge>
                  </Flex>
                  <Text muted size="13px">
                    Date: {entry.bookingDate} · {entry.preferredStartTime}–{entry.preferredEndTime} · {entry.slotType}
                  </Text>
                  {entry.confirmationDeadline && (
                    <Text size="12px" style={{ color: '#f59e0b', marginTop: 4 }}>
                      ⏰ Confirm before: {new Date(entry.confirmationDeadline).toLocaleTimeString()}
                    </Text>
                  )}
                </div>
                <Flex gap="8px">
                  <Button variant="accent"
                    disabled={confirming === entry._id}
                    onClick={() => handleConfirm(entry._id)}>
                    {confirming === entry._id ? <Spinner size="16px" /> : <><MdCheckCircle /> Confirm Now</>}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleLeave(entry._id)}>Skip</Button>
                </Flex>
              </Flex>
            </NotifiedCard>
          ))}
        </AnimatePresence>

        {loading ? (
          <Flex justify="center" style={{ padding: 60 }}><Spinner size="40px" /></Flex>
        ) : (
          <>
            {/* Active Waitlist */}
            {waiting.length > 0 && (
              <motion.div variants={itemAnim}>
                <Text style={{ fontWeight: 700, marginBottom: 12, color: '#94a3b8', textTransform:'uppercase', fontSize:12, letterSpacing:'0.1em' }}>
                  ⏳ Waiting ({waiting.length})
                </Text>
                {waiting.map((entry, i) => (
                  <WaitlistItem key={entry._id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}>
                    <div className="position">#{entry.position || i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <Flex gap="8px" align="center" style={{ marginBottom: 4 }}>
                        <Text style={{ fontWeight: 600 }}>
                          {entry.slotType === 'two-wheeler' ? '🏍️' : '🚗'} {entry.slotType}
                        </Text>
                        <Badge status="waiting">Waiting</Badge>
                      </Flex>
                      <Text muted size="13px">
                        {entry.bookingDate} · {entry.preferredStartTime} – {entry.preferredEndTime}
                      </Text>
                      <Text muted size="12px" style={{ marginTop: 2 }}>
                        Joined {new Date(entry.createdAt).toLocaleString()}
                      </Text>
                    </div>
                    <Button variant="danger" size="sm"
                      disabled={leaving === entry._id}
                      onClick={() => handleLeave(entry._id)}>
                      {leaving === entry._id ? <Spinner size="14px" /> : <><MdDelete /> Leave</>}
                    </Button>
                  </WaitlistItem>
                ))}
              </motion.div>
            )}

            {/* Past entries */}
            {past.length > 0 && (
              <motion.div variants={itemAnim} style={{ marginTop: 28 }}>
                <Text style={{ fontWeight: 700, marginBottom: 12, color: '#475569', textTransform:'uppercase', fontSize:12, letterSpacing:'0.1em' }}>
                  Past Entries
                </Text>
                {past.map(entry => (
                  <WaitlistItem key={entry._id} style={{ opacity: 0.55 }}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}>
                    <div className="position" style={{ background:'rgba(71,85,105,0.1)', color:'#64748b', borderColor:'rgba(71,85,105,0.2)' }}>—</div>
                    <div style={{ flex: 1 }}>
                      <Flex gap="8px" style={{ marginBottom: 4 }}>
                        <Text style={{ fontWeight: 600 }}>{entry.slotType}</Text>
                        <Badge status={entry.status}>{entry.status}</Badge>
                      </Flex>
                      <Text muted size="13px">{entry.bookingDate} · {entry.preferredStartTime}–{entry.preferredEndTime}</Text>
                    </div>
                  </WaitlistItem>
                ))}
              </motion.div>
            )}

            {waitlist.length === 0 && (
              <EmptyState>
                <div className="icon"><MdQueue /></div>
                <div className="title">Not on any waitlist</div>
                <div className="desc">When all slots are booked, you can join the waitlist and get notified automatically.</div>
                <Button style={{ marginTop: 20 }} onClick={() => setShowJoin(true)}>
                  <MdAdd /> Join Waitlist
                </Button>
              </EmptyState>
            )}
          </>
        )}
      </PageWrapper>

      {/* Join Waitlist Modal */}
      <AnimatePresence>
        {showJoin && (
          <JoinModal>
            <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowJoin(false)} />
            <GlassCard as={motion.form} onSubmit={handleJoin}
              style={{ position:'relative', zIndex:1, width:'100%', maxWidth:420, border:'1px solid rgba(59,130,246,0.3)' }}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
                <Title size="1.1rem">Join Waitlist</Title>
                <button onClick={() => setShowJoin(false)} style={{ background:'none', border:'none', color:'#64748b', fontSize:22, cursor:'pointer' }}>
                  <MdClose />
                </button>
              </Flex>

              <Flex direction="column" gap="14px">
                <InputGroup>
                  <Label>Preferred Date</Label>
                  <Input type="date" required
                    value={joinForm.bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setJoinForm({ ...joinForm, bookingDate: e.target.value })} />
                </InputGroup>
                <Flex gap="12px">
                  <InputGroup style={{ flex: 1 }}>
                    <Label>Start Time</Label>
                    <Input type="time" required
                      value={joinForm.preferredStartTime}
                      onChange={e => setJoinForm({ ...joinForm, preferredStartTime: e.target.value })} />
                  </InputGroup>
                  <InputGroup style={{ flex: 1 }}>
                    <Label>End Time</Label>
                    <Input type="time" required
                      value={joinForm.preferredEndTime}
                      onChange={e => setJoinForm({ ...joinForm, preferredEndTime: e.target.value })} />
                  </InputGroup>
                </Flex>
                <InputGroup>
                  <Label>Vehicle Type</Label>
                  <Select value={joinForm.slotType}
                    onChange={e => setJoinForm({ ...joinForm, slotType: e.target.value })}>
                    <option value="four-wheeler">Four Wheeler 🚗</option>
                    <option value="two-wheeler">Two Wheeler 🏍️</option>
                  </Select>
                </InputGroup>
              </Flex>

              <Text muted size="12px" style={{ margin: '16px 0', padding:'10px 12px', background:'rgba(59,130,246,0.06)', borderRadius:8 }}>
                📲 You'll receive a WhatsApp notification when a matching slot opens. You have 10 minutes to confirm.
              </Text>

              <Flex gap="10px">
                <Button type="button" variant="ghost" fullWidth onClick={() => setShowJoin(false)}>Cancel</Button>
                <Button type="submit" fullWidth disabled={joining}>
                  {joining ? <Spinner size="16px" /> : <><MdQueue /> Join Queue</>}
                </Button>
              </Flex>
            </GlassCard>
          </JoinModal>
        )}
      </AnimatePresence>
    </Layout>
  );
}
