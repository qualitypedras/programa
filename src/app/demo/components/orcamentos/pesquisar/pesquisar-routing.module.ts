import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PesquisarOrcamentoComponent } from './pesquisar.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: '', component: PesquisarOrcamentoComponent },
        ]),
    ],
    exports: [RouterModule],
})
export class PesquisarRoutingModule {}
