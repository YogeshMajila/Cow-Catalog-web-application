import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CowService } from '../../services/cow.service';
import { Cow, CowEvent } from '../../models/cow.model';

@Component({
    selector: 'app-cow-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cow-detail.component.html',
    styleUrl: './cow-detail.component.css'
})
export class CowDetailComponent implements OnInit {
    cow: Cow | undefined;
    sortedEvents: CowEvent[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private cowService: CowService
    ) { }

    ngOnInit(): void {
        const tag = this.route.snapshot.paramMap.get('tag');
        if (tag) {
            this.cow = this.cowService.getCowByTag(tag);
            if (this.cow) {
                this.sortedEvents = [...this.cow.events].sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );
            }
        }
        if (!this.cow) {
            this.router.navigate(['/']);
        }
    }

    goBack(): void {
        this.router.navigate(['/']);
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Active': return 'status-active';
            case 'In Treatment': return 'status-treatment';
            case 'Deceased': return 'status-deceased';
            default: return '';
        }
    }

    getEventIcon(type: string): string {
        switch (type) {
            case 'Weight Check': return '⚖️';
            case 'Treatment': return '💊';
            case 'Pen Move': return '🔄';
            case 'Death': return '✝️';
            default: return '📋';
        }
    }
}
