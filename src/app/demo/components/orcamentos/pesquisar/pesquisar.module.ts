import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PesquisarOrcamentoComponent } from './pesquisar.component';
import { PesquisarRoutingModule } from './pesquisar-routing.module';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { SplitButtonModule } from 'primeng/splitbutton';

registerLocaleData(localePt);
@NgModule({
    imports: [
        CommonModule,
        PesquisarRoutingModule,
        FormsModule,
        TableModule,
        RatingModule,
        ButtonModule,
        SliderModule,
        InputTextModule,
        ToggleButtonModule,
        RippleModule,
        MultiSelectModule,
        DropdownModule,
        ProgressBarModule,
        ToastModule,
        SplitButtonModule,
    ],
    declarations: [PesquisarOrcamentoComponent],
    providers: [
        {
            provide: LOCALE_ID,
            useValue: 'pt-BR',
        },
    ],
})
export class PesquisarOrcamentoModule {}
