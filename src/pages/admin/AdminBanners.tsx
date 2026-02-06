import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { useIsMobile } from "@/hooks/use-mobile";

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

// Mobile card component for banner list
function BannerCard({ 
  banner, 
  onEdit, 
  onDelete, 
  onToggleActive 
}: { 
  banner: DashboardBanner;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  return (
    <div className="border border-border rounded-lg p-3 space-y-3">
      {/* Preview + Order */}
      <div className="flex items-start gap-3">
        <div 
          className={`h-16 w-24 rounded-lg overflow-hidden flex-shrink-0 ${
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
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground">
            Ordem: {banner.order_index}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {banner.button_url}
          </p>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <Switch
            checked={banner.is_active}
            onCheckedChange={onToggleActive}
          />
          <span className="text-xs text-muted-foreground">
            {banner.is_active ? "Ativo" : "Inativo"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBanners() {
  const { banners, isLoading, createBanner, updateBanner, deleteBanner } = useDashboardBannersAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<DashboardBanner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(defaultFormData);
  const [isUploading, setIsUploading] = useState(false);
  const [linkWarning, setLinkWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setFormData({
      ...defaultFormData,
      order_index: banners.length + 1,
    });
    setLinkWarning(null);
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
    setLinkWarning(null);
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

  const validateAndFixLink = (url: string): string => {
    const trimmed = url.trim();
    
    // If empty, return as is (required field will catch it)
    if (!trimmed) return trimmed;
    
    // If it's an external URL, it's fine
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      setLinkWarning(null);
      return trimmed;
    }
    
    // If it starts with /, it's a valid internal route
    if (trimmed.startsWith("/")) {
      setLinkWarning(null);
      return trimmed;
    }
    
    // Otherwise, show warning and suggest fix
    setLinkWarning(`Parece um link interno. Você quis dizer "/${trimmed}"?`);
    return trimmed;
  };

  const handleLinkChange = (value: string) => {
    const validated = validateAndFixLink(value);
    setFormData({ ...formData, button_url: validated });
  };

  const handleApplyLinkFix = () => {
    if (formData.button_url && !formData.button_url.startsWith("/") && !formData.button_url.startsWith("http")) {
      setFormData({ ...formData, button_url: `/${formData.button_url}` });
      setLinkWarning(null);
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
    setLinkWarning(null);
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
      <div className="space-y-4 sm:space-y-6">
        {/* Header - responsive */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Gerenciar Banners</h1>
              <p className="text-sm text-muted-foreground">
                Edite os banners do carrossel
              </p>
            </div>
          </div>
          <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Banner
          </Button>
        </div>

        {/* Content */}
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
            ) : isMobile ? (
              // Mobile: Card list
              <div className="p-3 space-y-3">
                {banners.map((banner) => (
                  <BannerCard
                    key={banner.id}
                    banner={banner}
                    onEdit={() => handleOpenEdit(banner)}
                    onDelete={() => handleDelete(banner.id)}
                    onToggleActive={() => handleToggleActive(banner)}
                  />
                ))}
              </div>
            ) : (
              // Desktop: Table
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

        {/* Modal - responsive */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto">
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
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex-1 sm:flex-none"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Trocar Imagem
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="flex-1 sm:flex-none"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  onChange={(e) => handleLinkChange(e.target.value)}
                  placeholder="/eventos ou https://exemplo.com"
                  required
                />
                {linkWarning && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs">
                    <span className="text-warning">{linkWarning}</span>
                    <Button 
                      type="button" 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-xs"
                      onClick={handleApplyLinkFix}
                    >
                      Corrigir
                    </Button>
                  </div>
                )}
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

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createBanner.isPending || updateBanner.isPending}
                  className="w-full sm:w-auto"
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
