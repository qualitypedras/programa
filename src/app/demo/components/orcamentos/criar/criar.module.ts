import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CriarOrcamentoComponent } from './criar.component';
import { CriarOrcamentoRoutingModule } from './criar-routing.module';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { ChipsModule } from 'primeng/chips';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CriarOrcamentoRoutingModule,
        AutoCompleteModule,
        CalendarModule,
        ChipsModule,
        DropdownModule,
        InputMaskModule,
        InputNumberModule,
        CascadeSelectModule,
        MultiSelectModule,
        InputTextareaModule,
        InputTextModule,
        FormsModule,
        ReactiveFormsModule,
        DividerModule,
        CalendarModule,
        ToastModule,
        DialogModule,
        ConfirmDialogModule,
        PanelModule,
        AngularSignaturePadModule,
    ],
    declarations: [CriarOrcamentoComponent],
    providers: [ConfirmationService, MessageService],
})
export class CriarOrcamentoModule {}
