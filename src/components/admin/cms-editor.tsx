'use client'

import { useState } from "react";
import { updateSiteConfig, SiteConfigItem } from "@/actions/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";

type ConfigMap = Record<string, any>;

export function CmsEditor({ initialConfig }: { initialConfig: any[] }) {
  const { addToast } = useToast();
  
  // Convert array to object map for easier access
  const configMap = initialConfig.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as ConfigMap);

  const [formData, setFormData] = useState<ConfigMap>(configMap);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const saveConfig = async (section: string, fields: Record<string, any>) => {
    setIsSaving(true);
    try {
      const items: SiteConfigItem[] = Object.keys(fields).map(key => ({
        key,
        value: formData[key] ?? fields[key],
        section,
        description: `Config for ${key}`
      }));

      await updateSiteConfig(items);
      addToast("Configuration saved successfully", 'success');
    } catch (error) {
      console.error(error);
      addToast("Error saving configuration", 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Site Editor</h2>
          <p className="text-slate-400">Manage global content and settings.</p>
        </div>
      </div>

      <Tabs defaultValue="home" className="space-y-4">
        <TabsList className="bg-navy-900 border border-slate-800">
          <TabsTrigger value="home">Home Page</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
          <TabsTrigger value="theme">Theme & Styling</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="space-y-4">
          <Card className="bg-navy-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Hero Section</CardTitle>
              <CardDescription>Edit the main hero banner content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="home_hero_title" className="text-slate-200">Main Headline</Label>
                <Input 
                  id="home_hero_title" 
                  value={formData['home_hero_title'] ?? "Forge Insight, Architect The Future!"}
                  onChange={(e) => handleChange('home_hero_title', e.target.value)}
                  className="bg-navy-950 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="home_hero_subtitle" className="text-slate-200">Subtitle</Label>
                <Textarea 
                  id="home_hero_subtitle" 
                  value={formData['home_hero_subtitle'] ?? "High-fidelity digital agency platform. We architect digital solutions with precision, data-density, and cyber-minimalist aesthetics."}
                  onChange={(e) => handleChange('home_hero_subtitle', e.target.value)}
                  className="bg-navy-950 border-slate-700 text-white min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="home_hero_cta_primary" className="text-slate-200">Primary CTA Label</Label>
                  <Input 
                    id="home_hero_cta_primary" 
                    value={formData['home_hero_cta_primary'] ?? "START_PROJECT"}
                    onChange={(e) => handleChange('home_hero_cta_primary', e.target.value)}
                    className="bg-navy-950 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="home_hero_cta_secondary" className="text-slate-200">Secondary CTA Label</Label>
                  <Input 
                    id="home_hero_cta_secondary" 
                    value={formData['home_hero_cta_secondary'] ?? "VIEW_MANIFESTO"}
                    onChange={(e) => handleChange('home_hero_cta_secondary', e.target.value)}
                    className="bg-navy-950 border-slate-700 text-white"
                  />
                </div>
              </div>
              <Button 
                onClick={() => saveConfig('home', {
                  home_hero_title: "Forge Insight, Architect The Future!",
                  home_hero_subtitle: "High-fidelity digital agency platform. We architect digital solutions with precision, data-density, and cyber-minimalist aesthetics.",
                  home_hero_cta_primary: "START_PROJECT",
                  home_hero_cta_secondary: "VIEW_MANIFESTO"
                })} 
                disabled={isSaving}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Hero Section
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card className="bg-navy-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Services Section</CardTitle>
              <CardDescription>Edit the services section content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="services_title" className="text-slate-200">Section Title</Label>
                <Input 
                  id="services_title" 
                  value={formData['services_title'] ?? "Service Portfolio"}
                  onChange={(e) => handleChange('services_title', e.target.value)}
                  className="bg-navy-950 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="services_subtitle" className="text-slate-200">Section Subtitle</Label>
                <Textarea 
                  id="services_subtitle" 
                  value={formData['services_subtitle'] ?? "Comprehensive digital solutions engineered for performance, security, and scalability. We architect the future of your business."}
                  onChange={(e) => handleChange('services_subtitle', e.target.value)}
                  className="bg-navy-950 border-slate-700 text-white min-h-[100px]"
                />
              </div>
              <Button 
                onClick={() => saveConfig('services', {
                  services_title: "Service Portfolio",
                  services_subtitle: "Comprehensive digital solutions engineered for performance, security, and scalability. We architect the future of your business."
                })} 
                disabled={isSaving}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Services Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <Card className="bg-navy-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Footer Content</CardTitle>
              <CardDescription>Manage footer information and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="footer_text" className="text-slate-200">Copyright Text</Label>
                <Input 
                  id="footer_text" 
                  value={formData['footer_text'] ?? "© 2024 Onyx Dev Labs. All systems operational."}
                  onChange={(e) => handleChange('footer_text', e.target.value)}
                  className="bg-navy-950 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer_email" className="text-slate-200">Contact Email</Label>
                <Input 
                  id="footer_email" 
                  value={formData['footer_email'] ?? "hello@onyxdev.com"}
                  onChange={(e) => handleChange('footer_email', e.target.value)}
                  className="bg-navy-950 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer_address" className="text-slate-200">Physical Address</Label>
                <Input 
                  id="footer_address" 
                  value={formData['footer_address'] ?? "123 Cyber Avenue, Neo Tokyo, NT 2077"}
                  onChange={(e) => handleChange('footer_address', e.target.value)}
                  className="bg-navy-950 border-slate-700 text-white"
                />
              </div>
              <Button 
                onClick={() => saveConfig('footer', {
                  footer_text: "© 2024 Onyx Dev Labs. All systems operational.",
                  footer_email: "hello@onyxdev.com",
                  footer_address: "123 Cyber Avenue, Neo Tokyo, NT 2077"
                })} 
                disabled={isSaving}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Footer Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card className="bg-navy-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Global SEO Settings</CardTitle>
              <CardDescription>Manage default meta tags and search engine appearance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title" className="text-slate-200">Default Page Title</Label>
                <Input 
                  id="seo_title" 
                  value={formData['seo_title'] ?? "Onyx Dev Labs | Digital Architect"}
                  onChange={(e) => handleChange('seo_title', e.target.value)}
                  className="bg-navy-950 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo_description" className="text-slate-200">Meta Description</Label>
                <Textarea 
                  id="seo_description" 
                  value={formData['seo_description'] ?? "Premier digital agency specializing in high-performance web applications and data systems."}
                  onChange={(e) => handleChange('seo_description', e.target.value)}
                  className="bg-navy-950 border-slate-700 text-white"
                />
              </div>
              <Button 
                onClick={() => saveConfig('seo', {
                  seo_title: "Onyx Dev Labs | Digital Architect",
                  seo_description: "Premier digital agency specializing in high-performance web applications and data systems."
                })}
                disabled={isSaving}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save SEO Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <Card className="bg-navy-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Theme Configuration</CardTitle>
              <CardDescription>Customize global colors and fonts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme_primary_color" className="text-slate-200">Primary Color (Cyan)</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color"
                      id="theme_primary_color_picker" 
                      value={formData['theme_primary_color'] ?? "#06B6D4"}
                      onChange={(e) => handleChange('theme_primary_color', e.target.value)}
                      className="w-12 h-10 p-1 bg-navy-950 border-slate-700"
                    />
                    <Input 
                      id="theme_primary_color" 
                      value={formData['theme_primary_color'] ?? "#06B6D4"}
                      onChange={(e) => handleChange('theme_primary_color', e.target.value)}
                      className="bg-navy-950 border-slate-700 text-white flex-1"
                    />
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => saveConfig('theme', {
                  theme_primary_color: "#06B6D4"
                })}
                disabled={isSaving}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Theme Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
