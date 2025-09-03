import { PaymentMethod, FieldType } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "./ui/button";
import GenericField, { removeMask } from "./GenericField";
import { useMemo, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CreditCardFormProps = {
    idSeguro: string;
    paymentConfig: PaymentMethod | null;
    onErrorBackFn: () => void;
    useMutateFns: {
        onSuccess: (data: any) => void;
        onError: (error: any) => void;
        onSubmit: (data: any) => Promise<any>;
    }
}

export default function CreditCardForm({ idSeguro, paymentConfig, onErrorBackFn, useMutateFns }: CreditCardFormProps){
    
    const [clickedContinue, setClickedContinue] = useState(false);
    // Parse do jsonConf para obter os campos
    const fields = useMemo(() => {
        if (!paymentConfig?.jsonConf) return [];
        
        try {
            const parsed = JSON.parse(paymentConfig.jsonConf);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Erro ao fazer parse do jsonConf:', error);
            return [];
        }
    }, [paymentConfig?.jsonConf]);

    // Estado para armazenar os campos com seus valores
    const [fieldsWithValues, setFieldsWithValues] = useState<FieldType[]>(fields);

    const methods = useForm({
        mode: "onChange",
    });

    const { setError, clearErrors } = methods;

    // Função para atualizar o valor de um campo
    const updateFieldValue = (fieldName: string, value: string) => {
        setFieldsWithValues(prev => 
            prev.map(field => 
                field.campoApi === fieldName 
                    ? { ...field, conteudo: value }
                    : field
            )
        );
    };

    // Função para verificar valores dos campos obrigatórios
    const verifyValues = (): boolean => {
        let hasErrors = false;
        let errorsMessage: string[] = [];
        
        // Limpar erros anteriores
        clearErrors();
        
        fieldsWithValues.forEach((field: FieldType) => {
            if (field.obrigatorio && field.campoApi) {
                const value = field.conteudo;
                
                if (!value || value.trim() === '') {
                    setError(field.campoApi, {
                        type: 'manual',
                        message: `${field.nome || field.campoApi} é obrigatório`
                    });
                    hasErrors = true;
                    errorsMessage.push(`${field.nome || field.campoApi} é obrigatório`);
                    return
                }

                if (field.mask) {
                    const valueWithoutMask = removeMask(value, field.mask);
                    if (!valueWithoutMask || valueWithoutMask.trim() === '') {
                        setError(field.campoApi, {
                            type: 'manual',
                            message: `${field.nome || field.campoApi} é obrigatório`
                        });
                        hasErrors = true;
                        errorsMessage.push(`${field.nome || field.campoApi} é obrigatório`);
                    }

                    field.conteudo = valueWithoutMask;

                    if(field.mask === "card_data") {
                        // verificar se a data do cartão é válida (MM/YY)
                        const valueWithoutMask = removeMask(value, field.mask);
                        if (valueWithoutMask.length === 4) {
                            const month = parseInt(valueWithoutMask.substring(0, 2));
                            const year = parseInt(valueWithoutMask.substring(2, 4));
                            
                            // Validar mês (01-12)
                            if (month < 1 || month > 12) {
                                setError(field.campoApi, {
                                    type: 'manual',
                                    message: `${field.nome || field.campoApi} - Mês inválido`
                                });
                                hasErrors = true;
                                errorsMessage.push(`${field.nome || field.campoApi} - Mês inválido`);
                            }
                            
                            // Validar se não é uma data passada (ano atual + 10 anos)
                            const currentYear = new Date().getFullYear() % 100; // Últimos 2 dígitos
                            const maxYear = currentYear + 10;
                            
                            if (year < currentYear || year > maxYear) {
                                setError(field.campoApi, {
                                    type: 'manual',
                                    message: `${field.nome || field.campoApi} - Ano inválido`
                                });
                                hasErrors = true;
                                errorsMessage.push(`${field.nome || field.campoApi} - Ano inválido`);
                            }

                            field.conteudo = value;
                            return
                        } else {
                            setError(field.campoApi, {
                                type: 'manual',
                                message: `${field.nome || field.campoApi} - Formato inválido (MM/YY)`
                            });
                            hasErrors = true;
                            errorsMessage.push(`${field.nome || field.campoApi} - Formato inválido (MM/YY)`);
                        }
                    }

                }
            }
        });
        
        if (hasErrors) {
            toast.error(`Os seguintes campos estão inválidos: ${errorsMessage.join(', ')}`);
            setClickedContinue(false);
        }

        return !hasErrors;
    };

    const { mutate, isPending } = useMutation({
        mutationFn: () => useMutateFns.onSubmit({
            paymentConfig, 
            idSeguro, 
            cardData: fieldsWithValues // Enviar o array com os campos e valores
        }),
        onSuccess: (data: any) => useMutateFns.onSuccess(data),
        onError: (error: any) => {
            setClickedContinue(false);
            useMutateFns.onError(error);
        },
    });

    const onSubmit = (data: any) => {
        // Verificar valores antes de submeter
        console.log("Entrou no onSubmit");
        if (verifyValues()) {
            setClickedContinue(true);
            mutate(data);
        }

    };

    // Se não há campos configurados, mostrar mensagem
    if (fields.length === 0) {
        return (
            <Card className="w-full !p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Configuração de Pagamento</h1>
                    <p className="text-gray-600 mb-3">Nenhum campo configurado para este método de pagamento</p>
                    <Button 
                        type="button"
                        onClick={onErrorBackFn} 
                        variant="outline"
                    >
                        Selecionar outro método de pagamento
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="!p-6">
            <CardContent className="!p-0">
                <FormProvider {...methods}>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 w-full">
                        {fieldsWithValues.map((field: FieldType, index: number) => (
                            <GenericField 
                                key={`${field.campoApi}-${index}`} 
                                field={field}
                                onValueChange={(value) => {
                                    updateFieldValue(field.campoApi || '', value);
                                }}
                            />
                        ))}

                        {/* Botão de Envio */}
                        <div className="flex grid-cols-1 justify-between md:col-span-2 gap-3 mt-4">
                            <Button 
                                type="button"
                                onClick={() =>{
                                    if(clickedContinue){
                                        return;
                                    }
                                    onErrorBackFn();
                                }} 
                                variant="outline"
                                disabled={clickedContinue}
                                className={cn(clickedContinue && "cursor-not-allowed")}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="button"
                                onClick={() =>{
                                    onSubmit(methods.getValues());
                                }}
                                disabled={isPending}
                            >
                                {isPending ? "Processando..." : "Finalizar Pagamento"}
                            </Button>
                        </div>
                    </div>
                </FormProvider>
            </CardContent>
        </Card>
    );
}