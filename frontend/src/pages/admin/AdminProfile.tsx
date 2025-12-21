import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { User, Mail, Phone, MapPin, Lock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AdminProfile = () => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@appareldesk.com',
    phone: '+91 9876543210',
    address: '123 Business Park, Mumbai, India',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleProfileSave = () => {
    toast.success('Profile updated successfully');
  };

  const handlePasswordChange = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    toast.success('Password changed successfully');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>My Profile | Admin | ApparelDesk</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        {/* Main Content - Two Column Layout on Large Screens */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card - Takes 2 columns */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-muted/50 rounded-lg">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold text-xl">{profile.name}</h3>
                  <p className="text-muted-foreground">Administrator</p>
                  <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
                </div>
              </div>

              <Separator />

              <div className="grid sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="pl-10"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleProfileSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Password Card - Takes 1 column */}
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="mt-2"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Password must be at least 8 characters long
            </p>
            <Button onClick={handlePasswordChange} variant="outline" className="w-full gap-2">
              <Lock className="h-4 w-4" />
              Change Password
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
