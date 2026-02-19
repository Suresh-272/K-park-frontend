// src/pages/admin/AdminUsers.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdPerson, MdEdit, MdBlock, MdCheckCircle, MdClose, MdSearch } from 'react-icons/md';
import { adminAPI } from '../../services/api';
import {
  PageWrapper, PageHeader, Title, Text, Card, Badge, Button,
  Flex, Input, Select, InputGroup, Label, EmptyState, Spinner,
  ModalBackdrop, ModalSheet
} from '../../components/common/UI';
import Layout from '../../components/common/Layout';

const UserCard = styled(Card)`
  padding: 14px 16px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: default;
  border-radius: 12px;
`;

const Avatar = styled.div`
  width: 40px; height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 15px; color: #fff;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
  .name { font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .email { font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .meta { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 5px; }
`;

const ActionBtns = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;

  > * { flex: 1 1 160px; min-width: 0; }
  @media (max-width: 480px) { > * { flex: 1 1 calc(50% - 5px); } }
`;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = roleFilter ? { role: roleFilter } : {};
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({ role: user.role, isActive: user.isActive });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateUser(editUser._id, editForm);
      toast.success('User updated!');
      setEditUser(null);
      fetchUsers();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (user) => {
    try {
      await adminAPI.updateUser(user._id, { isActive: !user.isActive });
      toast.success(user.isActive ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.vehicleNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <PageWrapper initial={{ opacity:0 }} animate={{ opacity:1 }}>
        <PageHeader>
          <div>
            <Title size="1.6rem">Users</Title>
            <Text muted size="13px" style={{ marginTop:3 }}>{users.length} registered users</Text>
          </div>
        </PageHeader>

        <FilterRow>
          <div style={{ position:'relative', flex:'2 1 200px' }}>
            <MdSearch style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#475569', fontSize:18 }} />
            <Input placeholder="Search name, email, vehicle..."
              value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:40 }} />
          </div>
          <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </Select>
        </FilterRow>

        {loading ? (
          <Flex justify="center" style={{ padding:60 }}><Spinner size="40px" /></Flex>
        ) : filtered.length === 0 ? (
          <EmptyState>
            <div className="icon"><MdPerson /></div>
            <div className="title">No users found</div>
          </EmptyState>
        ) : (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
            {filtered.map(user => (
              <UserCard key={user._id}>
                <Avatar>{user.name.charAt(0).toUpperCase()}</Avatar>
                <UserInfo>
                  <div className="name">{user.name}</div>
                  <div className="email">{user.email}</div>
                  <div className="meta">
                    <Badge status={user.role}>{user.role}</Badge>
                    <Badge status={user.isActive ? 'active' : 'cancelled'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Text muted size="11px" style={{ fontFamily:'monospace' }}>{user.vehicleNumber}</Text>
                  </div>
                </UserInfo>
                <ActionBtns>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(user)}>
                    <MdEdit />
                  </Button>
                  <Button size="sm" variant={user.isActive ? 'danger' : 'success'}
                    onClick={() => toggleActive(user)}>
                    {user.isActive ? <MdBlock /> : <MdCheckCircle />}
                  </Button>
                </ActionBtns>
              </UserCard>
            ))}
          </motion.div>
        )}
      </PageWrapper>

      <AnimatePresence>
        {editUser && (
          <ModalBackdrop initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setEditUser(null)}>
            <ModalSheet onClick={e => e.stopPropagation()}
              initial={{ opacity:0, y:60 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:60 }} maxWidth="380px">
              <Flex justify="space-between" align="center" style={{ marginBottom:20 }}>
                <Title size="1.1rem">Edit User</Title>
                <button onClick={() => setEditUser(null)}
                  style={{ background:'none', border:'none', color:'#64748b', fontSize:22, cursor:'pointer', padding:4, minHeight:44, display:'flex', alignItems:'center' }}>
                  <MdClose />
                </button>
              </Flex>
              <Flex gap="10px" align="center" style={{ marginBottom:20, padding:'12px', background:'rgba(59,130,246,0.05)', borderRadius:10 }}>
                <Avatar>{editUser.name.charAt(0)}</Avatar>
                <div>
                  <Text style={{ fontWeight:600 }}>{editUser.name}</Text>
                  <Text muted size="12px">{editUser.email}</Text>
                </div>
              </Flex>
              <Flex direction="column" gap="14px" style={{ marginBottom:20 }}>
                <InputGroup>
                  <Label>Role</Label>
                  <Select value={editForm.role} onChange={e => setEditForm({...editForm, role:e.target.value})}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </Select>
                </InputGroup>
                <InputGroup>
                  <Label>Status</Label>
                  <Select value={editForm.isActive} onChange={e => setEditForm({...editForm, isActive:e.target.value==='true'})}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Select>
                </InputGroup>
              </Flex>
              <Flex gap="10px">
                <Button variant="ghost" fullWidth onClick={() => setEditUser(null)}>Cancel</Button>
                <Button fullWidth onClick={handleSave} disabled={saving}>
                  {saving ? <Spinner size="16px" /> : 'Save'}
                </Button>
              </Flex>
            </ModalSheet>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </Layout>
  );
}