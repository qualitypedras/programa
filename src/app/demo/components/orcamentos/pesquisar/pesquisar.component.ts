import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import {
    AngularFirestore,
    AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { jsPDF } from 'jspdf';

interface expandedRows {
    [key: string]: boolean;
}

@Component({
    templateUrl: './pesquisar.component.html',
    providers: [MessageService, ConfirmationService],
})
export class PesquisarOrcamentoComponent implements OnInit {
    statuses: any[] = [];

    rowGroupMetadata: any;

    expandedRows: expandedRows = {};

    activityValues: number[] = [0, 100];

    isExpanded: boolean = false;

    idFrozen: boolean = false;

    loading: boolean = true;

    @ViewChild('filter') filter!: ElementRef;

    orcamentos: any[] = [];
    private orcamentosCollection: AngularFirestoreCollection<any> | undefined;

    items: MenuItem[] = [];

    constructor(public afs: AngularFirestore, public router: Router) {
        this.items = [
            {
                label: 'Imprimir',
                icon: 'pi pi-print',
                command: () => {
                    this.imprimir();
                },
            },
            {
                label: 'Apagar',
                icon: 'pi pi-times',
                command: () => {},
            },
            {
                label: 'Angular.io',
                icon: 'pi pi-info',
                url: 'http://angular.io',
            },
            { separator: true },
            { label: 'Setup', icon: 'pi pi-cog', routerLink: ['/setup'] },
        ];
    }

    ngOnInit() {
        this.orcamentosCollection = this.afs.collection<any>('orcamentos');
        this.orcamentosCollection.snapshotChanges().subscribe({
            next: (value: any) => {
                this.orcamentos = [];
                for (let i = 0; i < value.length; i++) {
                    let data = value[i].payload.doc.data();
                    if (data.dataEnvio?.seconds)
                        data.dataEnvio = moment(
                            data.dataEnvio.seconds * 1000
                        ).toDate();

                    this.orcamentos.push(data);
                }
                this.loading = false;
            },
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    handleSelect(row) {
        this.router.navigate(['/orcamentos/criar'], {
            queryParams: { id: row.uid },
        });
    }

    downloadPdf(row) {
        console.log(row);
        const doc = new jsPDF();

        var img = new Image();
        img.src = 'assets/layout/images/logo-dark.png';
        doc.addImage(img, 'png', 10, 0, 60, 42);
        doc.setFontSize(11);

        doc.text(`Teresópolis, ${this.getDataCompleta()}.`, 140, 28);

        // nome cliente
        doc.setFont(`Helvetica`, 'bold');
        doc.text('Cliente: ', 18, 40);
        doc.setFont(`Helvetica`, 'normal');
        doc.text(`${row.nomeCliente}`, 33, 40);

        // endereço
        doc.setFont(`Helvetica`, 'bold');
        doc.text('Endereço: ', 18, 45);
        doc.setFont(`Helvetica`, 'normal');
        doc.text(
            `${row.enderecoCliente} - Nº ${row.numeroEnderecoCliente}, ${row.complementoCliente} - ${row.bairroCliente}`,
            38,
            45
        );

        // nome cliente
        doc.setFont(`Helvetica`, 'bold');
        doc.text('Telefone: ', 18, 50);
        doc.setFont(`Helvetica`, 'normal');
        doc.text(`${row.telCliente}`, 37, 50);

        doc.setFont(`Helvetica`, 'bold');
        doc.text('PROPOSTA', 100, 60, { align: 'center' });

        let x, y;
        x = 18;
        y = 70;
        for (let i = 0; i < row.ambientes.length; i++) {
            doc.setFont(`Helvetica`, 'bold');
            if (row.ambientes[i].descricao) {
                doc.text(row.ambientes[i].descricao, x, y);
                y = y + 5;
            } else {
                doc.text(row.ambientes[i].itens[0].especificacao, x, y);
                y = y + 5;
                for (let j = 1; j < row.ambientes[i].itens.length; j++) {
                    doc.setFont(`Helvetica`, 'normal');
                    doc.text(row.ambientes[i].itens[j].especificacao, x, y);
                    y = y + 5;
                    doc.text(row.ambientes[i].itens[j].especificacao, x, y);
                }
            }
        }
        console.log(row.ambientes[0]);
        console.log(row.ambientes[1]);

        doc.save(`${row.nomeCliente}.pdf`);
        return false;
    }

    imprimir() {}

    getDataCompleta() {
        const data = new Date();
        const dia = data.getDate();
        const mes = data.toLocaleDateString('pt-BR', { month: 'long' });
        const ano = data.getFullYear();
        return `${dia} de ${mes} de ${ano}`;
    }
}
