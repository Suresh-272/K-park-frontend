// src/pages/admin/AdminUsers.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { MdPerson, MdEdit, MdBlock, MdCheckCircle, MdClose, MdSearch } from 'react-icons/md';
import { adminAPI } from '../../services/api';
import {
  PageWrapper, PageHeader, Title, Text, Card, Badge,
  Button, Flex, Input, Select, InputGroup, Label,
  GlassCard, EmptyState, Spinner
} from '../../components/common/UI';
import Layout from '../../components/common/Layout';

const UserTable = styled.div`
  overflow-x: auto;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    white-space: nowrap;
  }

  td {
    padding: 13px 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    vertical-align: middle;
  }

  tr:last-child td { border-bottom: none; }

  tr:hover td {
    background: rgba(59,130,246,0.03);
  }
`;

const Avatar = styled.div`
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
`;

const EditModal = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;
const Overlay = styled(motion.div)`
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
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
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (user) => {
    try {
      await adminAPI.updateUser(user._id, { isActive: !user.isActive });
      toast.success(user.isActive ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch (err) { toast.error('Failed'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.vehicleNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <PageWrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageHeader>
          <div>
            <Title size="1.8rem">User Management</Title>
            <Text muted size="14px" style={{ marginTop: 4 }}>
              {users.length} registered users
            </Text>
          </div>
        </PageHeader>

        {/* Filters */}
        <Card style={{ marginBottom: 20, padding: '16px 20px' }}>
          <Flex gap="12px" wrap="wrap">
            <div style={{ position:'relative', flex:'2 1 240px' }}>
              <MdSearch style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#475569', fontSize:18 }} />
              <Input placeholder="Search by name, email, vehicle..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 38 }} />
            </div>
            <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ flex:'1 1 140px' }}>
              <option value="">All Roles</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </Select>
          </Flex>
        </Card>

        {loading ? (
          <Flex justify="center" style={{ padding: 60 }}><Spinner size="40px" /></Flex>
        ) : filtered.length === 0 ? (
          <EmptyState>
            <div className="icon"><MdPerson /></div>
            <div className="title">No users found</div>
          </EmptyState>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <UserTable>
              <Table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Vehicle</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => (
                    <tr key={user._id}>
                      <td>
                        <Flex gap="10px" align="center">
                          <Avatar>{user.name.charAt(0).toUpperCase()}</Avatar>
                          <div>
                            <Text style={{ fontWeight: 600 }}>{user.name}</Text>
                            <Text muted size="12px">{user.email}</Text>
                          </div>
                        </Flex>
                      </td>
                      <td><Badge status={user.role}>{user.role}</Badge></td>
                      <td><Text muted size="13px">{user.phone}</Text></td>
                      <td>
                        <Text style={{ fontFamily:'monospace', fontSize:13 }}>
                          {user.vehicleNumber}
                        </Text>
                      </td>
                      <td>
                        <Badge status={user.isActive ? 'active' : 'cancelled'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <Text muted size="12px">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Text>
                      </td>
                      <td>
                        <Flex gap="6px">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(user)}>
                            <MdEdit />
                          </Button>
                          <Button size="sm"
                            variant={user.isActive ? 'danger' : 'success'}
                            onClick={() => toggleActive(user)}>
                            {user.isActive ? <MdBlock /> : <MdCheckCircle />}
                          </Button>
                        </Flex>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </UserTable>
          </motion.div>
        )}
      </PageWrapper>

      {/* Edit Modal */}
      <AnimatePresence>
        {editUser && (
          <EditModal>
            <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditUser(null)} />
            <GlassCard as={motion.div}
              style={{ position:'relative', zIndex:1, width:'100%', maxWidth:380, border:'1px solid rgba(59,130,246,0.3)' }}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
                <Title size="1.1rem">Edit User</Title>
                <button onClick={() => setEditUser(null)} style={{ background:'none', border:'none', color:'#64748b', fontSize:22, cursor:'pointer' }}>
                  <MdClose />
                </button>
              </Flex>
              <Flex gap="10px" align="center" style={{ marginBottom: 20, padding:'12px 14px', background:'rgba(59,130,246,0.06)', borderRadius:10 }}>
                <Avatar>{editUser.name.charAt(0)}</Avatar>
                <div>
                  <Text style={{ fontWeight: 600 }}>{editUser.name}</Text>
                  <Text muted size="13px">{editUser.email}</Text>
                </div>
              </Flex>
              <Flex direction="column" gap="14px" style={{ marginBottom: 20 }}>
                <InputGroup>
                  <Label>Role</Label>
                  <Select value={editForm.role}
                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </Select>
                </InputGroup>
                <InputGroup>
                  <Label>Status</Label>
                  <Select value={editForm.isActive}
                    onChange={e => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Select>
                </InputGroup>
              </Flex>
              <Flex gap="10px">
                <Button variant="ghost" fullWidth onClick={() => setEditUser(null)}>Cancel</Button>
                <Button fullWidth onClick={handleSave} disabled={saving}>
                  {saving ? <Spinner size="16px" /> : 'Save Changes'}
                </Button>
              </Flex>
            </GlassCard>
          </EditModal>
        )}
      </AnimatePresence>
    </Layout>
  );
}
