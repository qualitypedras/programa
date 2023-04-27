import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'criar',
                data: { breadcrumb: 'Orcamentos' },
                loadChildren: () =>
                    import('./criar/criar.module').then(
                        (m) => m.CriarOrcamentoModule
                    ),
            },
            {
                path: 'pesquisar',
                data: { breadcrumb: 'Orcamentos' },
                loadChildren: () =>
                    import('./pesquisar/pesquisar.module').then(
                        (m) => m.PesquisarOrcamentoModule
                    ),
            },
            { path: '**', redirectTo: '/notfound' },
        ]),
    ],
    exports: [RouterModule],
})
export class OrcamentoRoutingModule {}
