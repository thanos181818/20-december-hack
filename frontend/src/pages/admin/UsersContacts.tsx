import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Users,
  UserCircle,
  Building2,
  MoreHorizontal,
  Edit,
  Trash2,
  Archive,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { useAdminData } from '@/contexts/AdminDataContext';

const UsersContacts = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    contacts,
    addContact,
    updateContact,
    deleteContact,
  } = useAdminData();
  
  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingContact, setEditingContact] = useState<any>(null);
  
  // Form states
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', address: '', role: 'portal' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', address: '', type: 'customer' });

  const internalUsers = users.filter(u => u.role === 'internal');
  const portalUsers = users.filter(u => u.role === 'portal');
  const vendors = contacts.filter(c => c.type === 'vendor' || c.type === 'both');
  const totalCustomers = internalUsers.length + portalUsers.length;

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.phone.includes(userSearchQuery) ||
    user.address.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
    contact.phone.includes(contactSearchQuery) ||
    contact.address.toLowerCase().includes(contactSearchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', phone: '', address: '', role: 'portal' });
    setUserDialogOpen(true);
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setContactForm({ name: '', email: '', phone: '', address: '', type: 'customer' });
    setContactDialogOpen(true);
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(user);
      setUserForm({ name: user.name, email: user.email, phone: user.phone, address: user.address, role: user.role });
      setUserDialogOpen(true);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    deleteUser(userId);
  };

  const handleEditContact = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setEditingContact(contact);
      setContactForm({ name: contact.name, email: contact.email, phone: contact.phone, address: contact.address, type: contact.type });
      setContactDialogOpen(true);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }
    await deleteContact(contactId);
  };

  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email || !userForm.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, { ...userForm });
    } else {
      addUser({ ...userForm, status: 'active', confirmed: true });
    }
    setUserDialogOpen(false);
  };

  const handleSaveContact = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingContact) {
      await updateContact(editingContact.id, { ...contactForm });
    } else {
      await addContact({ ...contactForm, status: 'active' });
    }
    setContactDialogOpen(false);
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Users & Contacts | Admin | ApparelDesk</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Users & Contacts</h1>
            <p className="text-muted-foreground">Manage users, customers, and vendors</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Users Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Users
                  </CardTitle>
                  <Button size="sm" onClick={() => setActiveTab('users')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Internal Users</p>
                      <p className="text-3xl font-bold">{internalUsers.length}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Portal Users</p>
                      <p className="text-3xl font-bold">{portalUsers.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contacts Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Contacts
                  </CardTitle>
                  <Button size="sm" onClick={() => setActiveTab('contacts')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Customers</p>
                      <p className="text-3xl font-bold">{totalCustomers}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Vendors</p>
                      <p className="text-3xl font-bold">{vendors.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />
              </div>
              <Button className="gap-2" onClick={handleAddUser}>
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCircle className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{user.address}</p>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.role === 'internal' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {user.role === 'internal' ? 'Internal' : 'Portal'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background">
                            <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )))
                  }
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-10"
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                />
              </div>
              <Button className="gap-2" onClick={handleAddContact}>
                <Plus className="h-4 w-4" />
                Add Contact
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No contacts found
                      </TableCell>
                    </TableRow>
                  ) : (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <p className="font-medium">{contact.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{contact.address}</p>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          contact.type === 'vendor' ? 'bg-purple-100 text-purple-700' :
                          contact.type === 'customer' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {contact.type === 'both' ? 'Customer & Vendor' : contact.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background">
                            <DropdownMenuItem onClick={() => handleEditContact(contact.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteContact(contact.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )))
                  }
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Dialog */}
        <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update user information below.' : 'Enter new user information below.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="user-name">Name *</Label>
                <Input
                  id="user-name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-email">Email *</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-phone">Phone *</Label>
                <Input
                  id="user-phone"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-address">Address</Label>
                <Textarea
                  id="user-address"
                  value={userForm.address}
                  onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                  placeholder="Enter address"
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-role">Role *</Label>
                <Select value={userForm.role} onValueChange={(v) => setUserForm({ ...userForm, role: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="portal">Portal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveUser}>
                {editingUser ? 'Update' : 'Add'} User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Contact Dialog */}
        <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
              <DialogDescription>
                {editingContact ? 'Update contact information below.' : 'Enter new contact information below.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="contact-name">Name *</Label>
                <Input
                  id="contact-name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-email">Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-phone">Phone *</Label>
                <Input
                  id="contact-phone"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-address">Address</Label>
                <Textarea
                  id="contact-address"
                  value={contactForm.address}
                  onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                  placeholder="Enter address"
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-type">Type *</Label>
                <Select value={contactForm.type} onValueChange={(v) => setContactForm({ ...contactForm, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="both">Customer & Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveContact}>
                {editingContact ? 'Update' : 'Add'} Contact
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default UsersContacts;
