// src/pages/WaitlistPage.js
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdQueue, MdDelete, MdCheckCircle, MdAdd, MdClose } from 'react-icons/md';
import { waitlistAPI } from '../services/api';
import {
  PageWrapper, PageHeader, Title, Text, Card, Badge, Button,
  Flex, InputGroup, Label, Input, Select, EmptyState, Spinner,
  ModalBackdrop, ModalSheet
} from '../components/common/UI';
import Layout from '../components/common/Layout';

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(6,182,212,0.4); }
  50% { box-shadow: 0 0 0 10px rgba(6,182,212,0); }
`;

const NotifiedBanner = styled(motion.div)`
  background: linear-gradient(135deg, rgba(6,182,212,0.1), rgba(59,130,246,0.07));
  border: 1px solid rgba(6,182,212,0.4);
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, #06b6d4, #3b82f6, #06b6d4);
    background-size: 200%;
    animation: shimmer 2s linear infinite;
  }

  .pulse-dot {
    width: 10px; height: 10px;
    background: #06b6d4; border-radius: 50%;
    animation: ${pulse} 1.5s ease-out infinite;
    flex-shrink: 0; margin-top: 4px;
  }
`;

const WaitItem = styled(motion.div)`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;

  &:active { transform: scale(0.99); }

  .pos {
    width: 36px; height: 36px;
    background: rgba(59,130,246,0.08);
    border: 1px solid rgba(59,130,246,0.2);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: ${({ theme }) => theme.fonts.display};
    font-weight: 700; font-size: 13px;
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
  }
`;

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemAnim = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

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
      toast.success("📋 Added to waitlist! WhatsApp notification on slot open.");
      setShowJoin(false);
      fetchWaitlist();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to join'); }
    finally { setJoining(false); }
  };

  const handleConfirm = async (id) => {
    setConfirming(id);
    try {
      await waitlistAPI.confirm(id);
      toast.success('🎉 Slot confirmed! Booking created.');
      fetchWaitlist();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
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
            <Title size="1.6rem">Waitlist</Title>
            <Text muted size="13px" style={{ marginTop: 3 }}>Get notified when a slot opens</Text>
          </div>
          <Button onClick={() => setShowJoin(true)}><MdAdd /> Join</Button>
        </PageHeader>

        {/* Notified banners */}
        <AnimatePresence>
          {notified.map(entry => (
            <NotifiedBanner key={entry._id}
              initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <Flex gap="12px" align="flex-start">
                <div className="pulse-dot" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Flex gap="8px" align="center" wrap="wrap" style={{ marginBottom: 6 }}>
                    <Text style={{ fontWeight: 700, fontSize: 14 }}>🟢 Slot available!</Text>
                    <Badge status="notified">ACT NOW</Badge>
                  </Flex>
                  <Text muted size="12px">
                    {entry.bookingDate} · {entry.preferredStartTime}–{entry.preferredEndTime}
                  </Text>
                  {entry.confirmationDeadline && (
                    <Text size="12px" style={{ color:'#f59e0b', marginTop: 3 }}>
                      ⏰ Expires: {new Date(entry.confirmationDeadline).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                    </Text>
                  )}
                  <Flex gap="8px" style={{ marginTop: 12 }}>
                    <Button variant="accent" size="sm"
                      disabled={confirming === entry._id}
                      onClick={() => handleConfirm(entry._id)} style={{ flex:1 }}>
                      {confirming === entry._id ? <Spinner size="14px" /> : <><MdCheckCircle /> Confirm</>}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleLeave(entry._id)}>Skip</Button>
                  </Flex>
                </div>
              </Flex>
            </NotifiedBanner>
          ))}
        </AnimatePresence>

        {loading ? (
          <Flex justify="center" style={{ padding: 60 }}><Spinner size="40px" /></Flex>
        ) : (
          <>
            {waiting.length > 0 && (
              <motion.div variants={itemAnim}>
                <Text style={{ fontWeight:700, marginBottom:10, color:'#94a3b8', fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                  ⏳ Waiting ({waiting.length})
                </Text>
                {waiting.map((entry, i) => (
                  <WaitItem key={entry._id}
                    initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.04 }}>
                    <div className="pos">#{entry.position || i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Flex gap="6px" align="center" wrap="wrap" style={{ marginBottom: 3 }}>
                        <Text style={{ fontWeight: 600, fontSize: 14 }}>
                          {entry.slotType === 'two-wheeler' ? '🏍️' : '🚗'} {entry.slotType}
                        </Text>
                        <Badge status="waiting">Waiting</Badge>
                      </Flex>
                      <Text muted size="12px">{entry.bookingDate} · {entry.preferredStartTime}–{entry.preferredEndTime}</Text>
                    </div>
                    <Button size="sm" variant="danger"
                      disabled={leaving === entry._id}
                      onClick={() => handleLeave(entry._id)}>
                      {leaving === entry._id ? <Spinner size="13px" /> : <MdDelete />}
                    </Button>
                  </WaitItem>
                ))}
              </motion.div>
            )}

            {past.length > 0 && (
              <motion.div variants={itemAnim} style={{ marginTop: 24 }}>
                <Text style={{ fontWeight:700, marginBottom:10, color:'#475569', fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                  Past Entries
                </Text>
                {past.map(entry => (
                  <WaitItem key={entry._id} style={{ opacity: 0.5 }}
                    initial={{ opacity:0 }} animate={{ opacity:0.5 }}>
                    <div className="pos" style={{ background:'rgba(71,85,105,0.1)', color:'#64748b', borderColor:'rgba(71,85,105,0.2)' }}>—</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Flex gap="6px" wrap="wrap" style={{ marginBottom: 3 }}>
                        <Text style={{ fontWeight:600, fontSize:13 }}>{entry.slotType}</Text>
                        <Badge status={entry.status}>{entry.status}</Badge>
                      </Flex>
                      <Text muted size="12px">{entry.bookingDate} · {entry.preferredStartTime}–{entry.preferredEndTime}</Text>
                    </div>
                  </WaitItem>
                ))}
              </motion.div>
            )}

            {waitlist.length === 0 && (
              <EmptyState>
                <div className="icon"><MdQueue /></div>
                <div className="title">Not on any waitlist</div>
                <div className="desc">Join when all slots are booked — get WhatsApp notification when one opens.</div>
                <Button style={{ marginTop: 20 }} onClick={() => setShowJoin(true)}>
                  <MdAdd /> Join Waitlist
                </Button>
              </EmptyState>
            )}
          </>
        )}
      </PageWrapper>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoin && (
          <ModalBackdrop initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setShowJoin(false)}>
            <ModalSheet as={motion.form} onSubmit={handleJoin}
              onClick={e => e.stopPropagation()}
              initial={{ opacity:0, y:60 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:60 }} maxWidth="420px">
              <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
                <Title size="1.1rem">Join Waitlist</Title>
                <button type="button" onClick={() => setShowJoin(false)}
                  style={{ background:'none', border:'none', color:'#64748b', fontSize:22, cursor:'pointer', padding:4, minHeight:44, display:'flex', alignItems:'center' }}>
                  <MdClose />
                </button>
              </Flex>

              <Flex direction="column" gap="14px">
                <InputGroup>
                  <Label>Date</Label>
                  <Input type="date" required value={joinForm.bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setJoinForm({ ...joinForm, bookingDate: e.target.value })} />
                </InputGroup>
                <Flex gap="10px">
                  <InputGroup style={{ flex:1 }}>
                    <Label>From</Label>
                    <Input type="time" required value={joinForm.preferredStartTime}
                      onChange={e => setJoinForm({ ...joinForm, preferredStartTime: e.target.value })} />
                  </InputGroup>
                  <InputGroup style={{ flex:1 }}>
                    <Label>To</Label>
                    <Input type="time" required value={joinForm.preferredEndTime}
                      onChange={e => setJoinForm({ ...joinForm, preferredEndTime: e.target.value })} />
                  </InputGroup>
                </Flex>
                <InputGroup>
                  <Label>Vehicle Type</Label>
                  <Select value={joinForm.slotType}
                    onChange={e => setJoinForm({ ...joinForm, slotType: e.target.value })}>
                    <option value="four-wheeler">🚗 Four Wheeler</option>
                    <option value="two-wheeler">🏍️ Two Wheeler</option>
                  </Select>
                </InputGroup>
              </Flex>

              <Text muted size="12px" style={{ margin:'16px 0', padding:'10px 12px', background:'rgba(59,130,246,0.06)', borderRadius:8 }}>
                📲 WhatsApp notification when a matching slot opens. 10 min to confirm.
              </Text>

              <Flex gap="10px">
                <Button type="button" variant="ghost" fullWidth onClick={() => setShowJoin(false)}>Cancel</Button>
                <Button type="submit" fullWidth disabled={joining}>
                  {joining ? <Spinner size="16px" /> : <><MdQueue /> Join</>}
                </Button>
              </Flex>
            </ModalSheet>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </Layout>
  );
}
