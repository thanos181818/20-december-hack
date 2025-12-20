import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminData, ProductStatus } from '@/contexts/AdminDataContext';
import { toast } from 'sonner';

const categories = ['Men', 'Women', 'Children'];
const types = ['Shirts', 'Pants', 'Kurtas', 'Dresses', 'Jackets'];
const materials = ['Cotton', 'Linen', 'Silk', 'Wool', 'Polyester'];
const presetColors = ['White', 'Black', 'Blue', 'Green', 'Red', 'Brown', 'Beige', 'Navy'];

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct } = useAdminData();
  const isEditing = !!id;
  const existingProduct = isEditing ? products.find(p => p.id === id) : null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<ProductStatus>(existingProduct?.status || 'new');
  const [customColor, setCustomColor] = useState('#000000');
  
  const [formData, setFormData] = useState({
    name: existingProduct?.name || '',
    category: existingProduct?.category || '',
    type: existingProduct?.type || '',
    material: existingProduct?.material || '',
    colors: existingProduct?.colors || [] as string[],
    stock: existingProduct?.stock || 0,
    salesPrice: existingProduct?.salesPrice || 0,
    salesTax: existingProduct?.salesTax || 18,
    purchasePrice: existingProduct?.purchasePrice || 0,
    purchaseTax: existingProduct?.purchaseTax || 12,
    published: existingProduct?.published || false,
    description: existingProduct?.description || '',
  });
  const [images, setImages] = useState<string[]>(existingProduct?.images || []);

  // Update form when editing and product loads
  useEffect(() => {
    if (existingProduct) {
      setStatus(existingProduct.status);
      setFormData({
        name: existingProduct.name,
        category: existingProduct.category,
        type: existingProduct.type,
        material: existingProduct.material || '',
        colors: existingProduct.colors || [],
        stock: existingProduct.stock,
        salesPrice: existingProduct.salesPrice,
        salesTax: existingProduct.salesTax,
        purchasePrice: existingProduct.purchasePrice,
        purchaseTax: existingProduct.purchaseTax,
        published: existingProduct.published,
        description: existingProduct.description || '',
      });
      setImages(existingProduct.images || []);
    }
  }, [existingProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.stock < 0) {
      toast.error('Stock cannot be negative');
      return;
    }

    if (formData.published && images.length === 0) {
      toast.error('Published products must have at least one image');
      return;
    }

    try {
      if (isEditing && id) {
        await updateProduct(id, {
          ...formData,
          status,
          images,
          price: formData.salesPrice,
        });
      } else {
        await addProduct({
          ...formData,
          status,
          images,
          price: formData.salesPrice,
        });
      }
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const toggleColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color],
    }));
  };

  const addCustomColor = () => {
    if (!formData.colors.includes(customColor)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, customColor]
      }));
      toast.success(`Color ${customColor} added`);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>{isEditing ? 'Edit Product' : 'New Product'} | Admin | ApparelDesk</title>
      </Helmet>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/products')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {isEditing ? 'Edit Product' : 'New Product'}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Update product details' : 'Add a new product to your catalog'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="gap-2"
              onClick={() => {
                if (isEditing && id) {
                  const currentIndex = products.findIndex(p => String(p.id) === String(id));
                  if (currentIndex > 0) {
                    navigate(`/admin/products/${products[currentIndex - 1].id}`);
                  }
                }
              }}
              disabled={!isEditing || !id || products.length === 0 || products.findIndex(p => String(p.id) === String(id)) <= 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="gap-2"
              onClick={() => {
                if (isEditing && id) {
                  const currentIndex = products.findIndex(p => String(p.id) === String(id));
                  if (currentIndex >= 0 && currentIndex < products.length - 1) {
                    navigate(`/admin/products/${products[currentIndex + 1].id}`);
                  }
                }
              }}
              disabled={!isEditing || !id || products.length === 0 || products.findIndex(p => String(p.id) === String(id)) >= products.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs value={status} onValueChange={(v) => {
          const newStatus = v as typeof status;
          setStatus(newStatus);
          // Sync published toggle with status
          if (newStatus === 'confirmed') {
            setFormData(prev => ({ ...prev, published: true }));
          } else {
            setFormData(prev => ({ ...prev, published: false }));
          }
        }}>
          <TabsList>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {types.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Material</Label>
                <Select
                  value={formData.material}
                  onValueChange={(v) => setFormData({ ...formData, material: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {materials.map((mat) => (
                      <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Enhanced Color Section */}
              <div className="space-y-3">
                <Label>Colors</Label>
                
                {/* 1. Selected Colors List */}
                <div className="flex flex-wrap gap-2 min-h-[2rem]">
                  {formData.colors.length > 0 ? (
                    formData.colors.map((color) => (
                      <span
                        key={color}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border bg-secondary text-secondary-foreground border-border"
                      >
                        <span 
                          className="w-3 h-3 rounded-full border border-black/10" 
                          style={{ backgroundColor: color.toLowerCase() }}
                        />
                        {color}
                        <button
                          type="button"
                          onClick={() => toggleColor(color)}
                          className="hover:text-destructive transition-colors ml-1"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">No colors selected</span>
                  )}
                </div>

                <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/20">
                  {/* 2. Custom Color Picker */}
                  <div className="flex items-end gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Custom Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="w-12 h-9 p-1 cursor-pointer"
                        />
                        <Input 
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="w-24 h-9 font-mono text-xs uppercase"
                          maxLength={7}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={addCustomColor}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </div>

                  {/* 3. Quick Add Presets */}
                  <div className="space-y-2">
                    <Label className="text-xs">Quick Add Presets</Label>
                    <div className="flex flex-wrap gap-2">
                      {presetColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          disabled={formData.colors.includes(color)}
                          onClick={() => toggleColor(color)}
                          className={`px-3 py-1 rounded-full text-xs border transition-all ${
                            formData.colors.includes(color)
                              ? 'opacity-50 cursor-not-allowed bg-muted'
                              : 'bg-background hover:border-primary hover:text-primary'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="stock">Current Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Pricing & Images */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salesPrice">Sales Price *</Label>
                    <Input
                      id="salesPrice"
                      type="number"
                      min="0"
                      value={formData.salesPrice}
                      onChange={(e) => setFormData({ ...formData, salesPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="salesTax">Sales Tax (%)</Label>
                    <Input
                      id="salesTax"
                      type="number"
                      min="0"
                      value={formData.salesTax}
                      onChange={(e) => setFormData({ ...formData, salesTax: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchaseTax">Purchase Tax (%)</Label>
                    <Input
                      id="purchaseTax"
                      type="number"
                      min="0"
                      value={formData.purchaseTax}
                      onChange={(e) => setFormData({ ...formData, purchaseTax: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {/* Published Toggle */}
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <div>
                    <Label htmlFor="published" className="text-base font-medium">Published</Label>
                    <p className="text-sm text-muted-foreground">
                      Visible on website
                    </p>
                  </div>
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => {
                      setFormData({ ...formData, published: checked });
                      // If unpublishing, set status to 'new'; if publishing, set to 'confirmed'
                      if (!checked && status === 'confirmed') {
                        setStatus('new');
                      } else if (checked && status === 'new') {
                        setStatus('confirmed');
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={triggerFileInput}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    className="hidden"
                    multiple
                    accept="image/*"
                  />
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop images here, or click to browse
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerFileInput();
                    }}
                  >
                    Choose Files
                  </Button>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt="" className="w-full h-24 object-cover rounded" />
                        <button
                          type="button"
                          className="absolute top-1 right-1 h-6 w-6 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default ProductForm;