import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Archive,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useAdminData, ProductStatus } from '@/contexts/AdminDataContext';
import { toast } from 'sonner';

const ProductsAdmin = () => {
  const navigate = useNavigate();
  const { products: adminProducts, updateProduct, deleteProduct } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ProductStatus>('confirmed');

  const filteredProducts = adminProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = p.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleTogglePublished = async (productId: string) => {
    const product = adminProducts.find(p => p.id === productId);
    if (!product) return;
    
    if (product.status !== 'confirmed') {
      toast.error('Only confirmed products can be published');
      return;
    }
    
    try {
      await updateProduct(productId, { published: !product.published });
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };
  const handleArchive = async (productId: string) => {
    try {
      await updateProduct(productId, { status: 'archived', published: false });
    } catch (error) {
      console.error('Error archiving product:', error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleEdit = (productId: string) => {
    navigate(`/admin/products/${productId}`);
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Products | Admin | ApparelDesk</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Link to="/admin/products/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Filters & Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader className="pb-0">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ProductStatus)}>
              <TabsList>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No img</span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.material || 'N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">₹{product.salesPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={product.stock < 20 ? 'text-orange-600 font-medium' : ''}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        {product.status === 'confirmed' && product.published ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            <Check className="h-3 w-3" />
                            Published
                          </span>
                        ) : product.status === 'confirmed' ? (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                            Draft
                          </span>
                        ) : product.status === 'new' ? (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            New
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            Archived
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background">
                            <DropdownMenuItem onClick={() => handleEdit(product.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {product.status === 'confirmed' && (
                              <DropdownMenuItem onClick={() => handlePublish(product.id)}>
                                <Check className="h-4 w-4 mr-2" />
                                {product.published ? 'Unpublish' : 'Publish'}
                              </DropdownMenuItem>
                            )}
                            {product.status !== 'archived' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleArchive(product.id)}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ProductsAdmin;
