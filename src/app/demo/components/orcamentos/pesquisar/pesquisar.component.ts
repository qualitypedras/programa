import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService, ConfirmationService } from 'primeng/api';
import {
    AngularFirestore,
    AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import * as moment from 'moment';

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

    constructor(public afs: AngularFirestore, public router: Router) {}

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
}
