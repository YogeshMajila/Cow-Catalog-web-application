import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CowService } from '../../services/cow.service';
import { Cow } from '../../models/cow.model';

@Component({
    selector: 'app-cow-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './cow-list.component.html',
    styleUrl: './cow-list.component.css'
})
export class CowListComponent implements OnInit, OnDestroy {
    cows: Cow[] = [];
    searchTerm = '';
    statusFilter = '';
    penFilter = '';
    pens: string[] = [];
    statuses = ['Active', 'In Treatment', 'Deceased'];

    private sub!: Subscription;
    private filterSub!: Subscription;

    constructor(
        private cowService: CowService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Restore filters from service (persisted across navigation)
        this.filterSub = this.cowService.searchTerm$.subscribe(t => this.searchTerm = t);
        this.filterSub.add(this.cowService.statusFilter$.subscribe(s => this.statusFilter = s));
        this.filterSub.add(this.cowService.penFilter$.subscribe(p => this.penFilter = p));

        this.sub = this.cowService.filteredCows$.subscribe(cows => {
            this.cows = cows;
        });

        // Update unique pen list whenever data changes
        this.sub.add(
            this.cowService.cows$.subscribe(() => {
                this.pens = this.cowService.getPens();
            })
        );
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
        this.filterSub?.unsubscribe();
    }

    onSearch(): void {
        this.cowService.setSearchTerm(this.searchTerm);
    }

    onStatusChange(): void {
        this.cowService.setStatusFilter(this.statusFilter);
    }

    onPenChange(): void {
        this.cowService.setPenFilter(this.penFilter);
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.statusFilter = '';
        this.penFilter = '';
        this.cowService.setSearchTerm('');
        this.cowService.setStatusFilter('');
        this.cowService.setPenFilter('');
    }

    viewCow(cow: Cow): void {
        this.router.navigate(['/cow', cow.earTag]);
    }

    addCow(): void {
        this.router.navigate(['/add']);
    }

    getLastEventDate(cow: Cow): string | null {
        return this.cowService.getLastEventDate(cow);
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Active': return 'status-active';
            case 'In Treatment': return 'status-treatment';
            case 'Deceased': return 'status-deceased';
            default: return '';
        }
    }
}
