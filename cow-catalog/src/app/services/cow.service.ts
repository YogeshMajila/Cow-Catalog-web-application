import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Cow, CowEvent, CowStatus } from '../models/cow.model';

@Injectable({ providedIn: 'root' })
export class CowService {
    private readonly STORAGE_KEY = 'cow_catalog_data';

    private cowsSubject = new BehaviorSubject<Cow[]>([]);
    private searchTermSubject = new BehaviorSubject<string>('');
    private statusFilterSubject = new BehaviorSubject<string>('');
    private penFilterSubject = new BehaviorSubject<string>('');

    cows$ = this.cowsSubject.asObservable();
    searchTerm$ = this.searchTermSubject.asObservable();
    statusFilter$ = this.statusFilterSubject.asObservable();
    penFilter$ = this.penFilterSubject.asObservable();

    /** Filtered cows — combines search + status + pen filters */
    filteredCows$: Observable<Cow[]> = combineLatest([
        this.cows$,
        this.searchTerm$,
        this.statusFilter$,
        this.penFilter$
    ]).pipe(
        map(([cows, search, status, pen]) => {
            return cows.filter(cow => {
                const matchesSearch = !search ||
                    cow.earTag.toLowerCase().includes(search.toLowerCase());
                const matchesStatus = !status || cow.status === status;
                const matchesPen = !pen || cow.pen === pen;
                return matchesSearch && matchesStatus && matchesPen;
            });
        })
    );

    constructor() {
        this.loadFromStorage();
    }

    // ---- Filter setters ----

    setSearchTerm(term: string): void {
        this.searchTermSubject.next(term);
    }

    setStatusFilter(status: string): void {
        this.statusFilterSubject.next(status);
    }

    setPenFilter(pen: string): void {
        this.penFilterSubject.next(pen);
    }

    // ---- CRUD ----

    getCowByTag(earTag: string): Cow | undefined {
        return this.cowsSubject.value.find(c => c.earTag === earTag);
    }

    isTagUnique(earTag: string): boolean {
        return !this.cowsSubject.value.some(c => c.earTag === earTag);
    }

    addCow(cow: Cow): void {
        const cows = [...this.cowsSubject.value, cow];
        this.cowsSubject.next(cows);
        this.saveToStorage(cows);
    }

    /** Returns all unique pen names */
    getPens(): string[] {
        const pens = new Set(this.cowsSubject.value.map(c => c.pen));
        return Array.from(pens).sort();
    }

    /** Helper: latest event date for a cow (or null) */
    getLastEventDate(cow: Cow): string | null {
        if (!cow.events.length) return null;
        const sorted = [...cow.events].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        return sorted[0].date;
    }

    // ---- Persistence ----

    private loadFromStorage(): void {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                this.cowsSubject.next(JSON.parse(raw) as Cow[]);
            } else {
                // seed with demo data
                const seed = this.generateSeedData();
                this.cowsSubject.next(seed);
                this.saveToStorage(seed);
            }
        } catch {
            const seed = this.generateSeedData();
            this.cowsSubject.next(seed);
            this.saveToStorage(seed);
        }
    }

    private saveToStorage(cows: Cow[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cows));
    }

    // ---- Seed Data ----

    private generateSeedData(): Cow[] {
        const now = new Date();
        const d = (daysAgo: number) =>
            new Date(now.getTime() - daysAgo * 86400000).toISOString();

        return [
            {
                earTag: 'TAG-1001',
                sex: 'Female',
                pen: 'Pen A',
                status: 'Active',
                weight: 520,
                dailyWeightGain: 0.8,
                createdAt: d(120),
                events: [
                    { id: 'e1', date: d(2), type: 'Weight Check', description: 'Routine weigh-in — 520 kg' },
                    { id: 'e2', date: d(30), type: 'Pen Move', description: 'Moved from Pen C to Pen A' },
                    { id: 'e3', date: d(60), type: 'Treatment', description: 'Administered vaccine booster' }
                ]
            },
            {
                earTag: 'TAG-1002',
                sex: 'Male',
                pen: 'Pen B',
                status: 'Active',
                weight: 610,
                dailyWeightGain: 1.1,
                createdAt: d(200),
                events: [
                    { id: 'e4', date: d(5), type: 'Weight Check', description: 'Routine weigh-in — 610 kg' }
                ]
            },
            {
                earTag: 'TAG-1003',
                sex: 'Female',
                pen: 'Pen A',
                status: 'In Treatment',
                weight: 480,
                dailyWeightGain: 0.4,
                createdAt: d(90),
                events: [
                    { id: 'e5', date: d(1), type: 'Treatment', description: 'Antibiotic course started for hoof infection' },
                    { id: 'e6', date: d(10), type: 'Weight Check', description: 'Routine weigh-in — 480 kg' }
                ]
            },
            {
                earTag: 'TAG-1004',
                sex: 'Male',
                pen: 'Pen C',
                status: 'Active',
                weight: 540,
                dailyWeightGain: 0.9,
                createdAt: d(150),
                events: [
                    { id: 'e7', date: d(7), type: 'Weight Check', description: 'Routine weigh-in — 540 kg' },
                    { id: 'e8', date: d(45), type: 'Pen Move', description: 'Moved from Pen B to Pen C' }
                ]
            },
            {
                earTag: 'TAG-1005',
                sex: 'Female',
                pen: 'Pen B',
                status: 'Deceased',
                weight: 390,
                createdAt: d(300),
                events: [
                    { id: 'e9', date: d(3), type: 'Death', description: 'Found deceased — natural causes suspected' },
                    { id: 'e10', date: d(20), type: 'Treatment', description: 'Treated for respiratory illness' },
                    { id: 'e11', date: d(40), type: 'Weight Check', description: 'Routine weigh-in — 390 kg' }
                ]
            },
            {
                earTag: 'TAG-1006',
                sex: 'Male',
                pen: 'Pen A',
                status: 'Active',
                weight: 700,
                dailyWeightGain: 1.3,
                createdAt: d(250),
                events: [
                    { id: 'e12', date: d(4), type: 'Weight Check', description: 'Routine weigh-in — 700 kg' }
                ]
            },
            {
                earTag: 'TAG-1007',
                sex: 'Female',
                pen: 'Pen C',
                status: 'In Treatment',
                weight: 460,
                dailyWeightGain: 0.3,
                createdAt: d(80),
                events: [
                    { id: 'e13', date: d(0), type: 'Treatment', description: 'Eye infection — topical ointment applied' },
                    { id: 'e14', date: d(15), type: 'Pen Move', description: 'Moved from Pen A to Pen C for isolation' }
                ]
            },
            {
                earTag: 'TAG-1008',
                sex: 'Male',
                pen: 'Pen B',
                status: 'Active',
                weight: 580,
                dailyWeightGain: 1.0,
                createdAt: d(100),
                events: [
                    { id: 'e15', date: d(6), type: 'Weight Check', description: 'Routine weigh-in — 580 kg' }
                ]
            }
        ];
    }
}
