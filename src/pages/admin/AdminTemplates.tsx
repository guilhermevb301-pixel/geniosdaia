import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, ArrowLeft, Upload, Image, FileJson, FileArchive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { 
  validateImageFile, 
  validateJsonFile, 
  validateJsonContent,
  validateZipFile,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_JSON_EXTENSIONS,
  ALLOWED_ZIP_EXTENSIONS 
} from "@/lib/fileValidation";

interface Template {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  json_url: string | null;
  zip_url: string | null;
  tags: string[];
  downloads_count: number;
  author_name: string | null;
  created_at: string;
}

export default function AdminTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [uploading, setUploading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [jsonUrl, setJsonUrl] = useState("");
  const [zipUrl, setZipUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Template[];
    },
  });

  async function uploadImageFile(file: File, folder: string): Promise<string> {
    // Validate image file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${folder}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("templates")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("templates")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function uploadJsonFile(file: File, folder: string): Promise<string> {
    // Validate JSON file
    const validation = validateJsonFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Validate JSON content structure
    await validateJsonContent(file);

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${folder}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("templates")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("templates")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function uploadZipFile(file: File, folder: string): Promise<string> {
    // Validate ZIP file
    const validation = validateZipFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${folder}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("templates")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("templates")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  const createMutation = useMutation({
    mutationFn: async (newTemplate: Omit<Template, "id" | "created_at" | "downloads_count">) => {
      const { data, error } = await supabase
        .from("templates")
        .insert({ ...newTemplate, downloads_count: 0 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({ title: "Template criado com sucesso!" });
      resetForm();
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Erro ao criar template", description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (template: Partial<Template> & { id: string }) => {
      const { data, error } = await supabase
        .from("templates")
        .update(template)
        .eq("id", template.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({ title: "Template atualizado com sucesso!" });
      resetForm();
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Erro ao atualizar template", description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({ title: "Template excluído com sucesso!" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Erro ao excluir template", description: error.message });
    },
  });

  function resetForm() {
    setDialogOpen(false);
    setEditingTemplate(null);
    setTitle("");
    setDescription("");
    setTags("");
    setAuthorName("");
    setImageUrl("");
    setJsonUrl("");
    setZipUrl("");
    setImageFile(null);
    setJsonFile(null);
    setZipFile(null);
  }

  function handleEdit(template: Template) {
    setEditingTemplate(template);
    setTitle(template.title);
    setDescription(template.description || "");
    setTags(template.tags?.join(", ") || "");
    setAuthorName(template.author_name || "");
    setImageUrl(template.image_url || "");
    setJsonUrl(template.json_url || "");
    setZipUrl(template.zip_url || "");
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);

    try {
      let finalImageUrl = imageUrl;
      let finalJsonUrl = jsonUrl;
      let finalZipUrl = zipUrl;

      // Upload image if new file selected
      if (imageFile) {
        finalImageUrl = await uploadImageFile(imageFile, "images");
      }

      // Upload JSON if new file selected
      if (jsonFile) {
        finalJsonUrl = await uploadJsonFile(jsonFile, "json");
      }

      // Upload ZIP if new file selected
      if (zipFile) {
        finalZipUrl = await uploadZipFile(zipFile, "zip");
      }

      const templateData = {
        title,
        description: description || null,
        image_url: finalImageUrl || null,
        json_url: finalJsonUrl || null,
        zip_url: finalZipUrl || null,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        author_name: authorName || null,
      };

      if (editingTemplate) {
        updateMutation.mutate({ ...templateData, id: editingTemplate.id });
      } else {
        createMutation.mutate(templateData);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro no upload", description: error.message });
    } finally {
      setUploading(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Templates</h1>
              <p className="text-muted-foreground">Upload de templates n8n com imagem e JSON</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingTemplate ? "Editar Template" : "Novo Template"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Fluxo de Automação WhatsApp"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descrição do template"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Autor</Label>
                  <Input
                    id="author"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Nome do autor"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="n8n, automação, whatsapp"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Imagem do Template
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="URL da imagem ou faça upload"
                      className="flex-1"
                    />
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept={ALLOWED_IMAGE_EXTENSIONS.join(',')}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const validation = validateImageFile(file);
                          if (!validation.valid) {
                            toast({ variant: "destructive", title: "Arquivo inválido", description: validation.error });
                            e.target.value = '';
                            return;
                          }
                          setImageFile(file);
                          setImageUrl(file.name);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {imageFile && (
                    <p className="text-sm text-muted-foreground">
                      Arquivo selecionado: {imageFile.name}
                    </p>
                  )}
                </div>

                {/* JSON Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    Arquivo JSON
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={jsonUrl}
                      onChange={(e) => setJsonUrl(e.target.value)}
                      placeholder="URL do JSON ou faça upload"
                      className="flex-1"
                    />
                    <input
                      ref={jsonInputRef}
                      type="file"
                      accept={ALLOWED_JSON_EXTENSIONS.join(',')}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const validation = validateJsonFile(file);
                          if (!validation.valid) {
                            toast({ variant: "destructive", title: "Arquivo inválido", description: validation.error });
                            e.target.value = '';
                            return;
                          }
                          // Validate JSON content
                          try {
                            await validateJsonContent(file);
                            setJsonFile(file);
                            setJsonUrl(file.name);
                          } catch (err: any) {
                            toast({ variant: "destructive", title: "JSON inválido", description: err.message });
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => jsonInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {jsonFile && (
                    <p className="text-sm text-muted-foreground">
                      Arquivo selecionado: {jsonFile.name}
                    </p>
                  )}
                </div>

                {/* ZIP Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileArchive className="h-4 w-4" />
                    Arquivo ZIP
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={zipUrl}
                      onChange={(e) => setZipUrl(e.target.value)}
                      placeholder="URL do ZIP ou faça upload"
                      className="flex-1"
                    />
                    <input
                      ref={zipInputRef}
                      type="file"
                      accept={ALLOWED_ZIP_EXTENSIONS.join(',')}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const validation = validateZipFile(file);
                          if (!validation.valid) {
                            toast({ variant: "destructive", title: "Arquivo inválido", description: validation.error });
                            e.target.value = '';
                            return;
                          }
                          setZipFile(file);
                          setZipUrl(file.name);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => zipInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {zipFile && (
                    <p className="text-sm text-muted-foreground">
                      Arquivo selecionado: {zipFile.name}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading || createMutation.isPending || updateMutation.isPending}
                  >
                    {uploading ? "Enviando..." : editingTemplate ? "Salvar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Templates ({templates?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : templates && templates.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagem</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>JSON</TableHead>
                    <TableHead>ZIP</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        {template.image_url ? (
                          <img
                            src={template.image_url}
                            alt={template.title}
                            className="h-12 w-20 rounded object-cover"
                          />
                        ) : (
                          <div className="h-12 w-20 rounded bg-muted flex items-center justify-center">
                            <Image className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{template.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {template.author_name || "-"}
                      </TableCell>
                      <TableCell>{template.downloads_count}</TableCell>
                      <TableCell>
                        {template.json_url ? (
                          <a
                            href={template.json_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <FileJson className="h-4 w-4" />
                            Ver
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {template.zip_url ? (
                          <a
                            href={template.zip_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <FileArchive className="h-4 w-4" />
                            Ver
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir este template?")) {
                                deleteMutation.mutate(template.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum template criado ainda. Clique em "Novo Template" para começar.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
