import { Component, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/shared/service/auth.service';
import { OrcamentoService } from '../orcamento.service';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as moment from 'moment';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
    NgSignaturePadOptions,
    SignaturePadComponent,
} from '@almothafar/angular-signature-pad';

@Component({
    templateUrl: './criar.component.html',
    styleUrls: ['./rascunho.component.scss'],
    providers: [AuthService, OrcamentoService],
})
export class CriarOrcamentoComponent {
    form = this.fb.group({
        nomeCliente: ['', [Validators.required]],
        telCliente: ['', [Validators.required]],
        cepCliente: [''],
        enderecoCliente: [''],
        bairroCliente: [''],
        numeroEnderecoCliente: [''],
        cidadeCliente: [''],
        estadoCliente: [''],
        complementoCliente: [''],
        dataEnvio: [moment(new Date()).toDate(), [Validators.required]],
        dataCriacao: [new Date().toLocaleString(), [Validators.required]],
        atendente: ['', [Validators.required]],
        informacaoAdicional: [''],
        observacao: [''],
        ambientes: this.fb.array([]),
    });

    orcamento: any;
    orcamentoId: string | undefined;
    loading = false;

    maxDate = new Date();

    rascunhoVisible = false;

    constructor(
        private fb: FormBuilder,
        public auth: AuthService,
        private orcamentoService: OrcamentoService,
        private route: ActivatedRoute,
        private http: HttpClient,
        public afs: AngularFirestore,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        public router: Router
    ) {
        this.form.get('atendente')?.setValue(auth.user.displayName);
    }

    ngOnInit() {
        this.route.queryParams.subscribe(async (params) => {
            const id = params['id'];
            this.orcamentoId = id;
            if (id) {
                this.afs
                    .collection('orcamentos')
                    .doc(id)
                    .ref.get()
                    .then((doc) => {
                        if (doc.exists) {
                            const data = doc.data() as any;
                            this.orcamento = data;
                            if (data.rascunhoData)
                                this.signaturePad.fromData(data.rascunhoData);
                            if (this.orcamento.dataEnvio?.seconds)
                                this.orcamento.dataEnvio = moment(
                                    this.orcamento.dataEnvio.seconds * 1000
                                ).toDate();
                            this.form.patchValue(this.orcamento, {
                                emitEvent: false,
                            });
                            if (this.orcamento?.ambientes) {
                                const ambiente = this.form.get(
                                    'ambientes'
                                ) as FormArray;
                                for (
                                    let i = 0;
                                    i < this.orcamento?.ambientes.length;
                                    i++
                                ) {
                                    ambiente.push(
                                        this.fb.group({
                                            descricao: [
                                                this.orcamento?.ambientes[i]
                                                    .descricao,
                                            ],
                                            itens: this.fb.array([]),
                                        })
                                    );

                                    for (
                                        let j = 0;
                                        j <
                                        this.orcamento?.ambientes[i]['itens']
                                            .length;
                                        j++
                                    ) {
                                        const item =
                                            this.orcamento?.ambientes[i][
                                                'itens'
                                            ][j];
                                        const ambienteToPush = this.form.get(
                                            'ambientes'
                                        ) as FormArray;
                                        const itensToPush = ambienteToPush
                                            .at(i)
                                            .get('itens') as FormArray;
                                        itensToPush.push(
                                            this.fb.group({
                                                quantidade: [item.quantidade],
                                                especificacao: [
                                                    item.especificacao,
                                                ],
                                                material: [item.material],
                                                comprimento: [item.comprimento],
                                                largura: [item.largura],
                                                profundidade: [
                                                    item.profundidade,
                                                ],
                                                valor: [item.valor],
                                                item: [item.item],
                                                metroQuadrado: [
                                                    item.metroQuadrado,
                                                ],
                                            })
                                        );
                                    }
                                }
                            }
                        }
                    })
                    .catch((error) => console.error(error));
            }
        });
        this.form.get('cepCliente')?.valueChanges.subscribe({
            next: (value) => {
                const cep = value?.replace(/[^\d]/g, '');
                if (cep && cep.length == 8) {
                    this.http
                        .get(`https://viacep.com.br/ws/${cep}/json/`)
                        .subscribe((data: any) => {
                            this.form.patchValue({
                                enderecoCliente: data.logradouro,
                                numeroEnderecoCliente: data.numero,
                                cidadeCliente: data.localidade,
                                estadoCliente: data.uf,
                                bairroCliente: data.bairro,
                            });
                        });
                }
            },
        });
        this.form.valueChanges.subscribe({
            next: () => {
                localStorage.setItem(
                    'orcamento-form-data',
                    JSON.stringify(this.form.value)
                );
            },
        });

        let formData: any = localStorage.getItem('orcamento-form-data');
        if (formData) {
            formData = JSON.parse(formData);
            this.form.patchValue(formData);
        }
    }

    toTitleCase(event) {
        const filterValue = (event.target as HTMLInputElement).value;
        const newString = filterValue.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
        this.form.get('nomeCliente')?.setValue(newString);
    }

    phoneMaskBrazil(event) {
        var key = event.key;
        var element = event.target;
        var isAllowed = /\d|Backspace|Tab/;
        if (!isAllowed.test(key)) event.preventDefault();

        var inputValue = element.value;
        inputValue = inputValue.replace(/\D/g, '');
        inputValue = inputValue.replace(/(^\d{2})(\d)/, '($1) $2');
        inputValue = inputValue.replace(/(\d{4,5})(\d{4}$)/, '$1-$2');

        element.value = inputValue;
    }

    zipCodeMask(event) {
        let value = event.target.value;

        if (!value) return;
        value = value.replace(/\D/g, '');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        event.target.value = value;
    }

    removerAmbiente(index) {
        const ambiente = this.form.get('ambientes') as FormArray;
        this.confirmationService.confirm({
            message: `Tem certeza que deseja excluir o ambiente <strong>${ambiente
                .at(index)
                .value.descricao?.toUpperCase()}</strong>? `,
            header: 'Confirmação',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                ambiente.removeAt(index);
                this.messageService.add({
                    severity: 'info',
                    summary: 'Sucesso!',
                    detail: 'Ambiente excluído.',
                });
            },
        });
    }

    removerItem(ambienteIndex, index) {
        const ambiente = this.form.get('ambientes') as FormArray;
        const itens = ambiente.at(ambienteIndex).get('itens') as FormArray;
        this.confirmationService.confirm({
            message: `Você tem certeza que deseja excluir o item <strong>${itens
                .at(index)
                .get('especificacao')
                ?.value.toUpperCase()}</strong>? `,
            header: 'Confirmação',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                itens.removeAt(index);
                this.messageService.add({
                    severity: 'info',
                    summary: 'Sucesso!',
                    detail: 'Item excluído.',
                });
            },
        });
    }

    duplicarItem(ambienteIndex, index) {
        const ambiente = this.form.get('ambientes') as FormArray;
        const itens = ambiente.at(ambienteIndex).get('itens') as FormArray;
        const item = itens.at(index) as any;
        itens.push(
            this.fb.group({
                quantidade: [item.controls['quantidade'].value],
                item: [item.controls['item'].value],
                especificacao: [item.controls['especificacao'].value],
                material: [item.controls['material'].value],
                comprimento: [item.controls['comprimento'].value],
                largura: [item.controls['largura'].value],
                profundidade: [item.controls['profundidade'].value],
                metroQuadrado: [item.control['metroQuadrado'].value],
                valor: [item.controls['valor'].value],
            })
        );
    }

    adicionarAmbiente() {
        const ambiente = this.form.get('ambientes') as FormArray;
        ambiente.push(
            this.fb.group({
                descricao: [''],
                itens: this.fb.array([]),
            })
        );
    }

    getItensAmbiente(ambienteIndex: number) {
        const ambiente = this.form.get('ambientes') as FormArray;
        const item = ambiente.at(ambienteIndex).get('itens') as FormArray;
        return item.controls;
    }

    adicionarItem(ambienteIndex: number) {
        const ambiente = this.form.get('ambientes') as FormArray;
        const itens = ambiente.at(ambienteIndex).get('itens') as FormArray;
        itens.push(
            this.fb.group({
                quantidade: [1],
                item: [''],
                especificacao: [''],
                material: [''],
                comprimento: [''],
                largura: [''],
                profundidade: [''],
                metroQuadrado: [''],
                valor: [''],
            })
        );

        let item = itens.controls[itens.controls.length - 1] as FormGroup;
        item.controls['comprimento'].valueChanges.subscribe({
            next: () => {
                const comprimento = item.controls['comprimento'].value;
                const largura = item.controls['largura'].value;
                if (comprimento && largura) {
                    const valor = comprimento * largura;
                    item.controls['metroQuadrado'].setValue(valor);
                }
            },
        });

        item.controls['largura'].valueChanges.subscribe({
            next: () => {
                if (
                    item.controls['comprimento'].value &&
                    item.controls['largura'].value
                ) {
                    const comprimento = item.controls['comprimento'].value;
                    const largura = item.controls['largura'].value;
                    if (comprimento && largura) {
                        const valor = comprimento * largura;
                        item.controls['metroQuadrado'].setValue(valor);
                    }
                }
            },
        });
    }

    async enviar() {
        this.loading = true;

        await this.confirmationService.confirm({
            message: `O atendente salvo será <strong>${
                this.form.get('atendente')?.value
            }</strong>. Deseja continuar?`,
            header: 'Confirmação',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                let form = this.form.value as any;
                form.valorTotal = this.getValorTotalItens();
                form.status = 'CRIADO';
                form.rascunho = this.signaturePad.toDataURL();
                form.rascunhoData = this.signaturePad.toData();
                if (!this.orcamentoId) form.uid = uuidv4();
                if (this.orcamentoId) form.uid = this.orcamentoId;
                this.orcamentoService.SaveOrcamento(form);
                this.messageService.add({
                    severity: 'info',
                    summary: 'Sucesso!',
                    detail: 'Orçamento salvo. Redirecionando...',
                });
                setTimeout(() => {
                    this.router.navigate(['/orcamentos/pesquisar']);
                }, 1500);
            },
        });

        this.loading = false;
    }

    getAmbientes() {
        const ambientes = this.form.get('ambientes') as FormArray;
        return ambientes.controls;
    }

    log(value) {
        console.log(value);
    }

    getValorTotalItens() {
        let valorTotal = 0;
        const ambiente = this.form.get('ambientes') as FormArray;
        ambiente.controls.forEach((ctrl: any) => {
            if (ctrl) {
                const ctrl2 = ctrl.controls['itens'].controls;
                ctrl2.forEach((ctrl3) => {
                    let valor = ctrl3.controls['valor'].value;
                    valorTotal += Number(valor);
                });
            }
        });
        return valorTotal;
    }

    @ViewChild('signature')
    public signaturePad!: SignaturePadComponent;

    signaturePadOptions: NgSignaturePadOptions = {
        // passed through to szimek/signature_pad constructor
        minWidth: 5,
        canvasWidth: 500,
        canvasHeight: 300,
        penColor: '#000',
    };

    draw() {
        const canvas = this.signaturePad.getCanvas();
        var ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.globalCompositeOperation = 'source-over'; // default value
    }

    erase() {
        this.signaturePad.options.minWidth = 20;
        this.signaturePad.options.maxWidth = 20;
        const canvas = this.signaturePad.getCanvas();
        var ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.globalCompositeOperation = 'destination-out';
    }

    clear() {
        localStorage.removeItem('orcamento-form-data');
        this.form = this.fb.group({
            nomeCliente: ['', [Validators.required]],
            telCliente: ['', [Validators.required]],
            cepCliente: [''],
            enderecoCliente: [''],
            bairroCliente: [''],
            numeroEnderecoCliente: [''],
            cidadeCliente: [''],
            estadoCliente: [''],
            complementoCliente: [''],
            dataEnvio: [moment(new Date()).toDate(), [Validators.required]],
            dataCriacao: [new Date().toLocaleString(), [Validators.required]],
            atendente: ['', [Validators.required]],
            informacaoAdicional: [''],
            observacao: [''],
            ambientes: this.fb.array([]),
        });
        this.form.get('atendente')?.setValue(this.auth.user.displayName);
    }
}
