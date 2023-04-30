import { Component, ViewChild } from '@angular/core';
import {
    Validators,
    FormBuilder,
    FormArray,
    FormGroup,
    Form,
} from '@angular/forms';
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

                            if (this.orcamento.dataEnvio?.seconds) {
                                this.orcamento.dataEnvio = moment(
                                    this.orcamento.dataEnvio.seconds * 1000
                                ).toDate();
                            }

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
                                            hideAmbiente: [
                                                Boolean(
                                                    this.orcamento?.ambientes[i]
                                                        .hideAmbiente
                                                ),
                                            ],
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

    removerTopico(ambienteIndex, index) {
        const ambiente = this.form.get('ambientes') as FormArray;
        const topicos = ambiente.at(ambienteIndex).get('topicos') as FormArray;
        this.confirmationService.confirm({
            message: `Você tem certeza que deseja excluir o tópico <strong>${topicos
                .at(index)
                .get('descricao')
                ?.value.toUpperCase()}</strong>? `,
            header: 'Confirmação',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                topicos.removeAt(index);
                this.messageService.add({
                    severity: 'info',
                    summary: 'Sucesso!',
                    detail: 'Item excluído.',
                });
            },
        });
    }

    removerItem(ambienteIndex, topicoIndex, index) {
        const ambiente = this.form.get('ambientes') as FormArray;
        const topicos = ambiente.at(ambienteIndex).get('topicos') as FormArray;
        const itens = topicos.at(topicoIndex).get('itens') as FormArray;
        const item = itens.at(index) as any;
        this.confirmationService.confirm({
            message: `Você tem certeza que deseja excluir o item <strong>${item
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

    removerMaterial(ambienteIndex, topicoIndex, index) {
        const ambiente = this.form.get('ambientes') as FormArray;
        const topicos = ambiente.at(ambienteIndex).get('topicos') as FormArray;
        const materiais = topicos.at(topicoIndex).get('materiais') as FormArray;
        const material = materiais.at(index) as any;
        this.confirmationService.confirm({
            message: `Você tem certeza que deseja excluir o material <strong>${material
                .get('descricao')
                ?.value.toUpperCase()}</strong>? `,
            header: 'Confirmação',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                materiais.removeAt(index);
                this.messageService.add({
                    severity: 'info',
                    summary: 'Sucesso!',
                    detail: 'Item excluído.',
                });
            },
        });
    }

    adicionarItem(ambienteIndex, topicoIndex) {
        debugger;
        const ambiente = this.form.get('ambientes') as FormArray;
        const topicos = ambiente.at(ambienteIndex).get('topicos') as FormArray;
        const itensToPush = topicos.at(topicoIndex).get('itens') as FormArray;
        itensToPush.push(
            this.fb.group({
                quantidade: [1],
                especificacao: [''],
                comprimento: [''],
                largura: [''],
                profundidade: [''],
                metroQuadrado: [''],
                valor: [''],
            })
        );

        const topico = topicos.controls[
            topicos.controls.length - 1
        ] as FormGroup;
        const itens = topico.controls['itens'] as FormArray;
        const item = itens.controls[itens.controls.length - 1] as FormGroup;
        const materiais = topico.controls['materiais'] as FormArray;
        const material = materiais.controls[
            materiais.controls.length - 1
        ] as FormGroup;

        item.controls['comprimento'].valueChanges.subscribe({
            next: () => {
                const comprimento = item.controls['comprimento'].value;
                const largura = item.controls['largura'].value;
                if (comprimento && largura) {
                    const metragem = comprimento * largura;
                    const quantidade = item.controls['quantidade'].value;
                    const valorMaterial = material.controls['valorm2'].value;
                    const valor = metragem * valorMaterial * quantidade;
                    item.controls['metroQuadrado'].setValue(metragem);
                    item.controls['valor'].setValue(valor);
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
                        const metragem = Number(
                            (comprimento * largura).toFixed(2)
                        );
                        const quantidade = item.controls['quantidade'].value;
                        const valorMaterial =
                            material.controls['valorm2'].value;
                        const valor = metragem * valorMaterial * quantidade;
                        item.controls['metroQuadrado'].setValue(metragem);
                        item.controls['valor'].setValue(valor);
                    }
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
                        const metragem = Number(
                            (comprimento * largura).toFixed(2)
                        );
                        const quantidade = item.controls['quantidade'].value;
                        const valorMaterial =
                            material.controls['valorm2'].value;
                        const valor = metragem * valorMaterial * quantidade;
                        item.controls['metroQuadrado'].setValue(metragem);
                        item.controls['valor'].setValue(valor);
                    }
                }
            },
        });
    }

    adicionarMaterial(ambienteIndex, topicoIndex) {
        const ambiente = this.form.get('ambientes') as FormArray;
        const topicos = ambiente.at(ambienteIndex).get('topicos') as FormArray;
        const materiais = topicos.at(topicoIndex).get('materiais') as FormArray;
        materiais.push(
            this.fb.group({
                descricao: [''],
                valorm2: [''],
            })
        );
    }

    duplicarItem(ambienteIndex, topicoIndex, index) {
        const ambiente = this.form.get('ambientes') as FormArray;
        const topicos = ambiente.at(ambienteIndex).get('topicos') as FormArray;
        const itens = topicos.at(topicoIndex).get('itens') as FormArray;
        const item = itens.at(index) as any;
        itens.push(
            this.fb.group({
                quantidade: [item.controls['quantidade'].value],
                especificacao: [item.controls['especificacao'].value],
                comprimento: [item.controls['comprimento'].value],
                largura: [item.controls['largura'].value],
                profundidade: [item.controls['profundidade'].value],
                metroQuadrado: [item.controls['metroQuadrado'].value],
                valor: [item.controls['valor'].value],
            })
        );
    }

    adicionarAmbiente() {
        const ambiente = this.form.get('ambientes') as FormArray;
        ambiente.push(
            this.fb.group({
                hideAmbiente: [false],
                descricao: [''],
                topicos: this.fb.array([]),
            })
        );
    }

    getTopicosAmbientes(ambienteIndex: number) {
        const ambiente = this.form.get('ambientes') as FormArray;
        const topicos = ambiente.at(ambienteIndex).get('topicos') as FormArray;
        return topicos.controls;
    }

    getItensTopicosAmbientes(ambienteIndex: number, topicoIndex: number) {
        const ambiente = this.form.get('ambientes') as FormArray;
        const topicos = ambiente.at(ambienteIndex).get('topicos') as FormArray;
        const itens = topicos.at(topicoIndex).get('itens') as FormArray;
        return itens.controls;
    }

    getMateriaisTopicosAmbientes(ambienteIndex: number, topicoIndex: number) {
        const ambiente = this.form.get('ambientes') as FormArray;
        const topicos = ambiente.at(ambienteIndex).get('topicos') as FormArray;
        const materiais = topicos.at(topicoIndex).get('materiais') as FormArray;
        return materiais.controls;
    }

    adicionarTopico(ambienteIndex: number) {
        debugger;
        const ambiente = this.form.get('ambientes') as FormArray;
        const topicos = ambiente.at(ambienteIndex).get('topicos') as FormArray;
        topicos.push(
            this.fb.group({
                descricao: [''],
                itens: this.fb.array([
                    this.fb.group({
                        quantidade: [1],
                        especificacao: [''],
                        comprimento: [''],
                        largura: [''],
                        profundidade: [''],
                        metroQuadrado: [''],
                        valor: [''],
                    }),
                ]),
                materiais: this.fb.array([
                    this.fb.group({
                        descricao: [''],
                        valorm2: [''],
                    }),
                ]),
            })
        );

        const topico = topicos.controls[
            topicos.controls.length - 1
        ] as FormGroup;
        const itens = topico.controls['itens'] as FormArray;
        const item = itens.controls[itens.controls.length - 1] as FormGroup;
        const materiais = topico.controls['materiais'] as FormArray;
        const material = materiais.controls[
            materiais.controls.length - 1
        ] as FormGroup;

        material.controls['valorm2'].valueChanges.subscribe({
            next: () => {
                const comprimento = item.controls['comprimento'].value;
                const largura = item.controls['largura'].value;
                if (comprimento && largura) {
                    const metragem = Number((comprimento * largura).toFixed(2));
                    const quantidade = item.controls['quantidade'].value;
                    const valorMaterial = material.controls['valorm2'].value;
                    const valor = metragem * valorMaterial * quantidade;
                    item.controls['metroQuadrado'].setValue(metragem);
                    item.controls['valor'].setValue(valor);
                }
            },
        });

        item.controls['comprimento'].valueChanges.subscribe({
            next: () => {
                const comprimento = item.controls['comprimento'].value;
                const largura = item.controls['largura'].value;
                if (comprimento && largura) {
                    const metragem = Number((comprimento * largura).toFixed(2));
                    const quantidade = item.controls['quantidade'].value;
                    const valorMaterial = material.controls['valorm2'].value;
                    const valor = metragem * valorMaterial * quantidade;
                    item.controls['metroQuadrado'].setValue(metragem);
                    item.controls['valor'].setValue(valor);
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
                        const metragem = Number(
                            (comprimento * largura).toFixed(2)
                        );
                        const quantidade = item.controls['quantidade'].value;
                        const valorMaterial =
                            material.controls['valorm2'].value;
                        const valor = metragem * valorMaterial * quantidade;
                        item.controls['metroQuadrado'].setValue(metragem);
                        item.controls['valor'].setValue(valor);
                    }
                }
            },
        });
    }

    async enviar() {
        this.loading = true;

        this.confirmationService.confirm({
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

    hideAmbiente(ambienteIndex) {
        const ambientes = this.form.get('ambientes') as FormArray;
        const ambiente = ambientes.at(ambienteIndex) as FormGroup;
        ambiente.controls['hideAmbiente'].setValue(true);
    }

    seeAmbiente(ambienteIndex) {
        const ambientes = this.form.get('ambientes') as FormArray;
        const ambiente = ambientes.at(ambienteIndex) as FormGroup;
        ambiente.controls['hideAmbiente'].setValue(false);
    }

    getAmbienteControls(index) {
        const ambientes = this.form.get('ambientes') as FormArray;
        const ambiente = ambientes.at(index) as FormGroup;
        return ambiente.controls;
    }
}
