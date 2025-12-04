import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SitesService, SiteDto } from '../../../services/sites.service';
import { CardsService, CardDto, CreateCardPayload } from '../../../services/cards.service';
import { AppStateService } from '../../../services/app-state.service';
import { Subject, takeUntil } from 'rxjs';

interface CardRow {
  id: number;
  cardType: string;
  cardNumber: string;
  siteName: string;
  siteId: number;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-settings-cards',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit, OnDestroy {
  cards: CardRow[] = [];
  allCards: CardRow[] = [];
  selectedSite: SiteDto | null = null;

  cardTypes = [
    { label: 'RFID', value: 1 },
    { label: 'NFC', value: 2 }
  ];
  siteOptions: { id: number; name: string }[] = [];
  statusOptions = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 2 }
  ];

  showDrawer = false;
  isSaving = false;
  addCardForm: FormGroup;
  openMenuIndex: number | null = null;
  editingIndex: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private sitesService: SitesService,
    private cardsService: CardsService,
    private appStateService: AppStateService
  ) {
    this.addCardForm = this.fb.group({
      cardType: [null, Validators.required],
      cardNumber: ['', Validators.required],
      siteId: [null, Validators.required],
      status: [1, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSites();
    this.subscribeToSelectedSite();
    this.loadCards();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToSelectedSite(): void {
    this.appStateService.selectedSite$
      .pipe(takeUntil(this.destroy$))
      .subscribe(site => {
        this.selectedSite = site;
        this.filterCardsBySite();
      });
  }

  openAddCard(): void {
    this.showDrawer = true;
    const defaultSiteId = this.selectedSite?.id ?? null;
    this.addCardForm.reset({
      cardType: null,
      cardNumber: '',
      siteId: defaultSiteId,
      status: 1
    });
    this.editingIndex = null;
  }

  closeAddCard(): void {
    if (this.isSaving) return;
    this.showDrawer = false;
    this.editingIndex = null;
  }

  submitAddCard(): void {
    if (this.addCardForm.invalid) {
      this.addCardForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const payload: CreateCardPayload = {
      id: this.editingIndex !== null ? this.cards[this.editingIndex].id : 0,
      type: Number(this.addCardForm.value.cardType),
      number: Number(this.addCardForm.value.cardNumber),
      siteId: Number(this.addCardForm.value.siteId),
      status: Number(this.addCardForm.value.status)
    };

    const request$ = this.editingIndex !== null
      ? this.cardsService.createCard(payload) // For now using create for both until update endpoint provided
      : this.cardsService.createCard(payload);

    request$.subscribe({
      next: (response) => {
        console.log('Card saved', response);
        this.loadCards();
        this.isSaving = false;
        this.showDrawer = false;
        this.editingIndex = null;
        this.addCardForm.reset({ cardType: null, cardNumber: '', siteId: null, status: 1 });
      },
      error: (error) => {
        console.error('Failed to save card', error);
        this.isSaving = false;
      }
    });
  }

  getStatusClass(status: 'Active' | 'Inactive'): string {
    return status.toLowerCase();
  }

  toggleMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  editCard(card: CardRow, event?: Event): void {
    event?.stopPropagation();
    this.openMenuIndex = null;
    this.showDrawer = true;
    this.addCardForm.patchValue({
      cardType: this.cardTypes.find(type => type.label === card.cardType)?.value ?? null,
      cardNumber: card.cardNumber,
      siteId: card.siteId,
      status: this.statusOptions.find(status => status.label === card.status)?.value ?? 1
    });
    this.editingIndex = this.cards.indexOf(card);
  }

  deleteCard(card: CardRow, event?: Event): void {
    event?.stopPropagation();
    this.openMenuIndex = null;
    this.cardsService.deleteCard(card.id).subscribe({
      next: (response) => {
        console.log('Card deleted', response);
        this.loadCards();
      },
      error: (error) => {
        console.error('Failed to delete card', error);
      }
    });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openMenuIndex = null;
  }

  private loadCards(): void {
    this.cardsService.getAllCards().subscribe({
      next: (cards) => {
        this.allCards = (cards || []).map(this.mapDtoToRow);
        this.filterCardsBySite();
      },
      error: (error) => {
        console.error('Failed to load cards', error);
        this.allCards = [];
        this.cards = [];
      }
    });
  }

  private filterCardsBySite(): void {
    if (!this.selectedSite) {
      this.cards = [];
      return;
    }

    const siteId = this.selectedSite.id;
    if (!siteId) {
      this.cards = [];
      return;
    }

    this.cards = this.allCards.filter(card => {
      const cardSiteId = this.normalizeId(card.siteId);
      const selectedSiteId = this.normalizeId(siteId);
      return cardSiteId === selectedSiteId;
    });
  }

  private loadSites(): void {
    this.sitesService.getAllSites().subscribe({
      next: (sites: SiteDto[]) => {
        this.siteOptions = (sites || [])
          .map(site => ({
            id: site.id ?? 0,
            name: site.siteName ?? site.name ?? ''
          }))
          .filter(site => site.id);
      },
      error: (error) => {
        console.error('Failed to load sites for cards', error);
      }
    });
  }

  private mapDtoToRow = (dto: CardDto): CardRow => {
    const siteId = this.normalizeId(dto.siteId) ?? 0;
    const cardId = dto.id ?? 0;
    return {
      id: cardId,
      cardType: this.cardTypes.find(type => type.value === dto.type)?.label ?? 'Unknown',
      cardNumber: dto.cardNumber
        ? String(dto.cardNumber)
        : dto.number !== undefined && dto.number !== null
          ? String(dto.number)
          : '—',
      siteName: dto.siteName ?? this.siteOptions.find(site => site.id === siteId)?.name ?? '—',
      siteId: siteId,
      status: String(dto.status) === '1' ? 'Active' : 'Inactive'
    };
  };

  private normalizeId(value: number | string | undefined | null): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    const numeric = typeof value === 'string' ? parseInt(value, 10) : value;
    return Number.isNaN(numeric) ? null : numeric;
  }
}
