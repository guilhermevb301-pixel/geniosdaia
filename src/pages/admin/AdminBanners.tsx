import { useState } from "react";
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
import { ArrowLeft, Plus, Pencil, Trash2, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardBannersAdmin, DashboardBanner } from "@/hooks/useDashboardBanners";

type BannerFormData = Omit<DashboardBanner, "id" | "created_at">;

const defaultFormData: BannerFormData = {
  title: "",
  subtitle: "",
  image_url: "",
  gradient: "from-primary to-purple-600",
  button_text: "Saiba Mais",
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
      title: banner.title,
      subtitle: banner.subtitle || "",
      image_url: banner.image_url || "",
      gradient: banner.gradient || "from-primary to-purple-600",
      button_text: banner.button_text || "Saiba Mais",
      button_url: banner.button_url,
      order_index: banner.order_index,
      is_active: banner.is_active,
      height: banner.height || 176,
      width_type: banner.width_type || "half",
    });
    setIsModalOpen(true);
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
                    <TableHead>Título</TableHead>
                    <TableHead>Link</TableHead>
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
                              alt={banner.title}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{banner.title}</p>
                          {banner.subtitle && (
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {banner.subtitle}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground truncate max-w-[150px] block">
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
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Junte-se à Comunidade"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle || ""}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Ex: Conecte-se com outros automatizadores"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  value={formData.image_url || ""}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="button_text">Texto do Botão</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text || ""}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    placeholder="Saiba Mais"
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
                <Label htmlFor="button_url">Link do Botão *</Label>
                <Input
                  id="button_url"
                  value={formData.button_url}
                  onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                  placeholder="/eventos ou https://exemplo.com"
                  required
                />
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
