import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Upload, Search, Camera, Image as ImageIcon, Sparkles, X, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface SearchResult {
  product_id: number;
  product_name: string;
  similarity_score: number;
  image_url: string | null;
  price: number;
  category: string | null;
}

const VisualSearch = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults([]);
      setHasSearched(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults([]);
      setHasSearched(false);
    } else {
      toast.error('Please drop an image file');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResults([]);
    setHasSearched(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSearch = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    setIsSearching(true);
    setHasSearched(false);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await api.post('/visual-search/search', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResults(response.data.results || []);
      setHasSearched(true);

      if (response.data.results?.length > 0) {
        toast.success(`Found ${response.data.results.length} similar products!`);
      } else {
        toast.info('No similar products found. Try a different image.');
      }
    } catch (error) {
      console.error('Visual search error:', error);
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const getMatchBadgeColor = (score: number) => {
    if (score >= 30) return 'bg-green-500';
    if (score >= 25) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <Layout>
      <Helmet>
        <title>Visual Search | ApparelDesk</title>
        <meta name="description" content="Search products by image using AI" />
      </Helmet>

      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered Feature (Beta)
          </div>
          <h1 className="text-4xl font-bold mb-3">Visual Search</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload an image of clothing you like, and our AI will find similar products in our catalog
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Upload Image
              </CardTitle>
              <CardDescription>
                Drag & drop or click to upload an image of the clothing you're looking for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
                >
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Drop your image here</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                  <p className="text-xs text-muted-foreground">
                    Supports: JPG, PNG, WEBP
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Selected"
                    className="w-full h-80 object-contain rounded-xl bg-muted"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={clearImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Button
                className="w-full mt-4 gap-2"
                size="lg"
                onClick={handleSearch}
                disabled={!selectedImage || isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Find Similar Products
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Search Results
              {results.length > 0 && (
                <Badge variant="secondary">{results.length} found</Badge>
              )}
            </h2>

            {!hasSearched && !isSearching && (
              <Card className="p-12 text-center">
                <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Upload an image and click "Find Similar Products" to see results
                </p>
              </Card>
            )}

            {isSearching && (
              <Card className="p-12 text-center">
                <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
                <p className="text-lg font-medium">Analyzing your image...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Our AI is comparing it with our product catalog
                </p>
              </Card>
            )}

            {hasSearched && results.length === 0 && (
              <Card className="p-12 text-center">
                <Search className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium">No similar products found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try uploading a different image of clothing
                </p>
              </Card>
            )}

            {results.length > 0 && (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <Card
                    key={result.product_id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/products/${result.product_id}`)}
                  >
                    <div className="flex">
                      <div className="w-32 h-32 bg-muted flex-shrink-0">
                        {result.image_url ? (
                          <img
                            src={result.image_url}
                            alt={result.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{result.product_name}</h3>
                            {result.category && (
                              <Badge variant="outline" className="mt-1">
                                {result.category}
                              </Badge>
                            )}
                          </div>
                          <Badge className={`${getMatchBadgeColor(result.similarity_score)} text-white`}>
                            {result.similarity_score.toFixed(1)}% Match
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">
                            ₹{result.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            #{index + 1} Best Match
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* How it works */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>How Visual Search Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">1. Upload Image</h3>
                <p className="text-sm text-muted-foreground">
                  Take a photo or upload an image of clothing you like
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">2. AI Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Our CLIP AI model analyzes the image features and style
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">3. Get Matches</h3>
                <p className="text-sm text-muted-foreground">
                  See similar products from our catalog ranked by similarity
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VisualSearch;
