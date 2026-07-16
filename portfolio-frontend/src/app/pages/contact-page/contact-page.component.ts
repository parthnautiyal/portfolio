import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getPersonal } from '../../utils/contentLoader';

type FormState = {
  name: string;
  email: string;
  message: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  message?: string;
  attachment?: string;
};

type Attachment = {
  file: File;
  base64: string;
};

const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3 MB
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.css']
})
export class ContactPageComponent {
  personal = getPersonal();

  form: FormState = {
    name: '',
    email: '',
    message: ''
  };

  errors: FormErrors = {};
  submitting = false;
  status: 'idle' | 'success' | 'error' = 'idle';
  attachment: Attachment | null = null;
  dragActive = false;

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  onInputChange(name: string) {
    if (this.errors[name as keyof FormErrors]) {
      this.errors[name as keyof FormErrors] = undefined;
    }
  }

  async handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      await this.handleFileSelect(file);
    }
  }

  async handleFileSelect(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      this.errors.attachment = 'Only PDF, DOC, DOCX, JPG, or PNG allowed.';
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      this.errors.attachment = `File too large — max 3 MB (got ${(file.size / 1024 / 1024).toFixed(1)} MB).`;
      return;
    }
    this.errors.attachment = undefined;
    
    try {
      const base64 = await this.readAsBase64(file);
      this.attachment = { file, base64 };
    } catch (e) {
      this.errors.attachment = 'Failed to read attachment file.';
    }
  }

  private readAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragActive = true;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.dragActive = false;
  }

  async onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragActive = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      await this.handleFileSelect(file);
    }
  }

  triggerFileSelect() {
    this.fileInputRef.nativeElement.click();
  }

  removeAttachment() {
    this.attachment = null;
    if (this.fileInputRef && this.fileInputRef.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!this.form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (this.form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!this.form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!this.form.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (this.form.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  async handleSubmit() {
    this.status = 'idle';
    if (!this.validateForm()) return;

    try {
      this.submitting = true;
      const body: Record<string, any> = { ...this.form };
      if (this.attachment) {
        body['attachment'] = {
          name: this.attachment.file.name,
          mimeType: this.attachment.file.type,
          data: this.attachment.base64,
        };
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      this.status = 'success';
      this.form = { name: '', email: '', message: '' };
      this.removeAttachment();
    } catch {
      this.status = 'error';
    } finally {
      this.submitting = false;
    }
  }

  handleWhatsAppClick() {
    const decryptedPhone = atob('NzQ1Mzg4Njg4NQ==');
    const url = `https://wa.me/91${decryptedPhone}?text=Hi%20Parth,%20I%20saw%20your%20portfolio...`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  getInputClass(hasError: boolean): string {
    return `w-full rounded-xl px-4 py-3 text-sm outline-none border transition-all duration-300 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm text-[var(--color-text)] placeholder:text-slate-400 dark:placeholder:text-slate-600 ${
      hasError
        ? 'border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
        : 'border-slate-200/60 dark:border-slate-800/60 hover:border-slate-350 dark:hover:border-slate-700 focus:border-blue-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-sky-400/20'
    }`;
  }
}
