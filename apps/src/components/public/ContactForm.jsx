'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const LEADS_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1'}/leads/public`;

const formSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  empresa: z.string().min(1, 'La empresa es requerida'),
  cargo: z.string().optional(),
  correo: z.string().email('Correo electrónico inválido'),
  telefono: z.string().min(1, 'El teléfono es requerido'),
  servicio: z.string().min(1, 'Selecciona un servicio'),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

const serviceOptions = [
  ['DyxerCRM', 'DyxerCRM'],
  ['DyxerSales', 'DyxerSales'],
  ['DyxerFinance', 'DyxerFinance'],
  ['DyxerFlow', 'DyxerFlow'],
  ['DyxerAnalytics', 'DyxerAnalytics'],
  ['PIGIM', 'PIGIM'],
  ['Bespa', 'Bespa'],
  ['desarrollo-saas', 'Desarrollo SaaS'],
  ['software-personalizado', 'Software personalizado'],
  ['ingenieria-datos-bi', 'Ingeniería de datos / BI'],
  ['automatizacion-ia', 'Automatización / IA'],
  ['consultoria-tecnologica', 'Consultoría tecnológica'],
  ['otro', 'Otro'],
];

const serviceLabels = Object.fromEntries(serviceOptions);

function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: zodResolver(formSchema),
  });

  const servicioValue = watch('servicio');
  const inputClass = 'border-border bg-background/55 text-foreground placeholder:text-muted-foreground';

  useEffect(() => {
    try {
      const preferredService = sessionStorage.getItem('dyxersoft_contact_servicio');
      if (preferredService) {
        setValue('servicio', preferredService, { shouldValidate: true });
        sessionStorage.removeItem('dyxersoft_contact_servicio');
      }
    } catch {
      // Ignore storage errors.
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(LEADS_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.nombre,
          companyName: data.empresa,
          position: data.cargo || null,
          email: data.correo,
          phone: data.telefono,
          serviceInterest: serviceLabels[data.servicio] || data.servicio,
          message: data.mensaje,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'No se pudo guardar el lead');
      }
      toast.success('Tu mensaje fue enviado correctamente. Te contactaremos pronto.');
      reset();
    } catch (error) {
      toast.error(error?.message || 'No se pudo enviar el formulario. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre" className="text-foreground">Nombre *</Label>
          <Input id="nombre" {...register('nombre')} placeholder="Tu nombre completo" className={inputClass} />
          {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="empresa" className="text-foreground">Empresa *</Label>
          <Input id="empresa" {...register('empresa')} placeholder="Nombre de tu empresa" className={inputClass} />
          {errors.empresa && <p className="text-sm text-destructive">{errors.empresa.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cargo" className="text-foreground">Cargo</Label>
          <Input id="cargo" {...register('cargo')} placeholder="Tu cargo en la empresa" className={inputClass} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="correo" className="text-foreground">Correo electrónico *</Label>
          <Input id="correo" type="email" {...register('correo')} placeholder="tu@email.com" className={inputClass} />
          {errors.correo && <p className="text-sm text-destructive">{errors.correo.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono" className="text-foreground">Teléfono / WhatsApp *</Label>
          <Input id="telefono" {...register('telefono')} placeholder="62069477" className={inputClass} />
          {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="servicio" className="text-foreground">Producto o servicio de interés *</Label>
          <Select onValueChange={(value) => setValue('servicio', value, { shouldValidate: true })} value={servicioValue}>
            <SelectTrigger id="servicio" className={inputClass}>
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              {serviceOptions.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.servicio && <p className="text-sm text-destructive">{errors.servicio.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mensaje" className="text-foreground">Mensaje *</Label>
        <Textarea id="mensaje" {...register('mensaje')} placeholder="Cuéntanos qué proceso quieres mejorar, conectar o automatizar..." rows={5} className={`${inputClass} resize-none`} />
        {errors.mensaje && <p className="text-sm text-destructive">{errors.mensaje.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] md:w-auto">
        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : 'Enviar mensaje'}
      </Button>
    </form>
  );
}

export default ContactForm;
