import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Pencil, Trash2, Image, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardBannersAdmin, DashboardBanner } from "@/hooks/useDashboardBanners";
import { supabase } from "@/integrations/supabase/client";
import { validateImageFile } from "@/lib/fileValidation";
import { toast } from "sonner";

type BannerFormData = Omit<DashboardBanner, "id" | "created_at">;

const defaultFormData: BannerFormData = {
  title: "Banner",
  subtitle: null,
  image_url: "",
  gradient: "from-primary to-purple-600",
  button_text: null,
  button_url: "",
  order_index: 0,
  is_active: true,
  height: 176,
  width_type: "half",
};

export default function AdminBanners() {
  const { banners, isLoading, createBanner, updateBanner, deleteBanner } = useDashboardBannersAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<DashboardBanner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(defaultFormData);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setFormData({
      ...defaultFormData,
      order_index: banners.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: DashboardBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "Banner",
      subtitle: null,
      image_url: banner.image_url || "",
      gradient: banner.gradient || "from-primary to-purple-600",
      button_text: null,
      button_url: banner.button_url,
      order_index: banner.order_index,
      is_active: banner.is_active,
      height: banner.height || 176,
      width_type: banner.width_type || "half",
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('banners')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success("Imagem carregada com sucesso!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erro ao carregar imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const bannerData = {
      ...formData,
      subtitle: formData.subtitle || null,
      image_url: formData.image_url || null,
    };

    if (editingBanner) {
      await updateBanner.mutateAsync({ id: editingBanner.id, ...bannerData });
    } else {
      await createBanner.mutateAsync(bannerData);
    }
    
    setIsModalOpen(false);
    setEditingBanner(null);
    setFormData(defaultFormData);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este banner?")) {
      await deleteBanner.mutateAsync(id);
    }
  };

  const handleToggleActive = async (banner: DashboardBanner) => {
    await updateBanner.mutateAsync({
      id: banner.id,
      is_active: !banner.is_active,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gerenciar Banners</h1>
              <p className="text-muted-foreground">
                Edite os banners do carrossel do Dashboard
              </p>
            </div>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Banner
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : banners.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Image className="h-8 w-8 mb-2" />
                <p>Nenhum banner cadastrado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Ordem</TableHead>
                    <TableHead className="w-20">Preview</TableHead>
                    <TableHead>Link de Destino</TableHead>
                    <TableHead className="w-20">Ativo</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell className="font-medium">{banner.order_index}</TableCell>
                      <TableCell>
                        <div 
                          className={`h-10 w-16 rounded overflow-hidden ${
                            banner.image_url 
                              ? "" 
                              : `bg-gradient-to-br ${banner.gradient}`
                          }`}
                        >
                          {banner.image_url && (
                            <img 
                              src={banner.image_url} 
                              alt="Banner"
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                          {banner.button_url}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={banner.is_active}
                          onCheckedChange={() => handleToggleActive(banner)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(banner)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(banner.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? "Editar Banner" : "Novo Banner"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Imagem do Banner</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
                {formData.image_url ? (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-32 object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Trocar Imagem
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        <span className="text-sm text-muted-foreground">Carregando...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Clique para escolher uma imagem
                        </span>
                        <span className="text-xs text-muted-foreground">
                          JPG, PNG, WebP, GIF (máx. 10MB)
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Se não houver imagem, será usado o gradiente abaixo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gradient">Gradiente (fallback)</Label>
                <Input
                  id="gradient"
                  value={formData.gradient || ""}
                  onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                  placeholder="from-primary to-purple-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order_index">Ordem</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 176 })}
                    min={100}
                    max={400}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width_type">Largura</Label>
                  <select
                    id="width_type"
                    value={formData.width_type}
                    onChange={(e) => setFormData({ ...formData, width_type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="half">Metade (50%)</option>
                    <option value="third">Um terço (33%)</option>
                    <option value="full">Largura total (100%)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="button_url">Link de Destino *</Label>
                <Input
                  id="button_url"
                  value={formData.button_url}
                  onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                  placeholder="/eventos ou https://exemplo.com"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Para onde o usuário vai ao clicar no banner
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Banner ativo</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createBanner.isPending || updateBanner.isPending}
                >
                  {editingBanner ? "Salvar Alterações" : "Criar Banner"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
