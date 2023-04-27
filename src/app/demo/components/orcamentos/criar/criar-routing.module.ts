import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CriarOrcamentoComponent } from './criar.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: '', component: CriarOrcamentoComponent },
        ]),
    ],
    exports: [RouterModule],
})
export class CriarOrcamentoRoutingModule {}
