import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CowService } from '../../services/cow.service';
import { Cow } from '../../models/cow.model';

@Component({
    selector: 'app-cow-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './cow-form.component.html',
    styleUrl: './cow-form.component.css'
})
export class CowFormComponent {
    form: FormGroup;
    tagError = '';

    constructor(
        private fb: FormBuilder,
        private cowService: CowService,
        private router: Router
    ) {
        this.form = this.fb.group({
            earTag: ['', [Validators.required]],
            sex: ['', [Validators.required]],
            pen: ['', [Validators.required]],
            status: ['Active', [Validators.required]],
            weight: [null, [Validators.min(0.1)]]
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { earTag, sex, pen, status, weight } = this.form.value;

        // Check uniqueness
        if (!this.cowService.isTagUnique(earTag)) {
            this.tagError = 'This ear tag is already in use.';
            return;
        }
        this.tagError = '';

        const newCow: Cow = {
            earTag,
            sex,
            pen,
            status,
            weight: weight ?? undefined,
            events: [],
            createdAt: new Date().toISOString()
        };

        this.cowService.addCow(newCow);
        this.router.navigate(['/']);
    }

    cancel(): void {
        this.router.navigate(['/']);
    }

    /** Helper for template */
    isInvalid(field: string): boolean {
        const ctrl = this.form.get(field);
        return !!(ctrl && ctrl.invalid && ctrl.touched);
    }
}
