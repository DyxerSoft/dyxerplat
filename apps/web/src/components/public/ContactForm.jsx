'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mlgywkel';

const formSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  empresa: z.string().min(1, 'La empresa es requerida'),
  cargo: z.string().optional(),
  correo: z.string().email('Correo electronico invalido'),
  telefono: z.string().min(1, 'El telefono es requerido'),
  servicio: z.string().min(1, 'Selecciona un servicio'),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

const serviceLabels = {
  'demo-pigim': 'Demo de PIGIM',
  'desarrollo-saas': 'Desarrollo SaaS',
  'software-personalizado': 'Software personalizado',
  'ingenieria-datos-bi': 'Ingenieria de datos/BI',
  automatizacion: 'Automatizacion',
  consultoria: 'Consultoria tecnologica',
};

function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const servicioValue = watch('servicio');
  const inputClass = 'border-border bg-background/55 text-foreground placeholder:text-muted-foreground';

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const timestamp = new Date().toISOString();
      const serviceLabel = serviceLabels[data.servicio] || data.servicio;
      const payload = {
        nombre: data.nombre,
        empresa: data.empresa,
        cargo: data.cargo || 'No indicado',
        correo: data.correo,
        email: data.correo,
        telefono: data.telefono,
        servicio: serviceLabel,
        mensaje: data.mensaje,
        enviado_en: timestamp,
        _subject: `Nuevo contacto Dyxersoft: ${data.empresa}`,
        _replyto: data.correo,
      };

      localStorage.setItem(`dyxersoft_contact_${Date.now()}`, JSON.stringify(payload));

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Formspree request failed');
      }

      toast.success('Tu mensaje fue enviado correctamente. Te contactaremos pronto.');
      reset();
    } catch (error) {
      toast.error('No se pudo enviar el formulario. Por favor intenta nuevamente.');
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
          <Label htmlFor="correo" className="text-foreground">Correo electronico *</Label>
          <Input id="correo" type="email" {...register('correo')} placeholder="tu@email.com" className={inputClass} />
          {errors.correo && <p className="text-sm text-destructive">{errors.correo.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono" className="text-foreground">Telefono / WhatsApp *</Label>
          <Input id="telefono" {...register('telefono')} placeholder="62069477" className={inputClass} />
          {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="servicio" className="text-foreground">Servicio de interes *</Label>
          <Select onValueChange={(value) => setValue('servicio', value, { shouldValidate: true })} value={servicioValue}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Selecciona un servicio" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              <SelectItem value="demo-pigim">Demo de PIGIM</SelectItem>
              <SelectItem value="desarrollo-saas">Desarrollo SaaS</SelectItem>
              <SelectItem value="software-personalizado">Software personalizado</SelectItem>
              <SelectItem value="ingenieria-datos-bi">Ingenieria de datos/BI</SelectItem>
              <SelectItem value="automatizacion">Automatizacion</SelectItem>
              <SelectItem value="consultoria">Consultoria tecnologica</SelectItem>
            </SelectContent>
          </Select>
          {errors.servicio && <p className="text-sm text-destructive">{errors.servicio.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mensaje" className="text-foreground">Mensaje *</Label>
        <Textarea
          id="mensaje"
          {...register('mensaje')}
          placeholder="Cuentanos sobre tu operacion, canales actuales y volumen aproximado de incidencias..."
          rows={5}
          className={`${inputClass} resize-none`}
        />
        {errors.mensaje && <p className="text-sm text-destructive">{errors.mensaje.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] md:w-auto"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          'Enviar mensaje'
        )}
      </Button>
    </form>
  );
}

export default ContactForm;
