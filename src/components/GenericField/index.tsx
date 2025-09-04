import { FieldType, TpOptions } from "@/types";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useFormContext } from "react-hook-form";

interface GenericFieldProps {
    field: FieldType;
    onValueChange?: (value: string) => void;
}

// Função para formatar CPF
export const formatCPF = (value: string) => {
    const v = value.replace(/\D/g, '');
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatOptions = (options: string) => {
    if (!options) return [];
    try {
        return options
        .split(";")
        .map((option) => {
            const [label, value] = option.split(":").map((str) => str?.trim());
            if (label && value) {
            return { label, value };
            }
            return null;
        })
        .filter((opt): opt is TpOptions => opt !== null);
    } catch (error) {
        console.log(error);
        console.log("Erro ao formatar opções do campo")
        return [];
    }
    };

// Função para formatar data
export const formatDate = (value: string): string => {
    const v = value.replace(/\D/g, '');
    return v.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
};

    // Função para remover máscara do CPF
export const removeCPFMask = (value: string) => {
    return value.replace(/\D/g, '');
};

// Função para remover máscara do número do cartão
export const removeCardNumberMask = (value: string) => {
    return value.replace(/\s+/g, '');
};

// Função para remover máscara baseada no tipo
export const removeMask = (value: string, maskType?: string) => {
    if (!maskType) return value;
    
    switch (maskType) {
        case 'cpf':
            return removeCPFMask(value);
        case 'cartao_credito':
            return removeCardNumberMask(value);
        default:
            return value;
    }
};

    // Função para formatar data do cartão (MM/YY)
    const formatCardDate = (value: string) => {
        const v = value.replace(/\D/g, '');
        if (v.length >= 2) {
            const month = v.substring(0, 2);
            const year = v.substring(2, 4);
            return `${month}/${year}`;
        }
        return v;
    };

// Função para formatar número do cartão
export const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
        return parts.join(' ');
    } else {
        return v;
    }
};

// Aplicar máscara baseada no tipo do campo
export const applyMask = (value: string, maskType?: string) => {
    if (!maskType) return value;
    
    switch (maskType) {
        case 'cpf':
            return formatCPF(value);
        case 'data':
            return formatDate(value);
        case 'card_date':
            return formatCardDate(value);
        case 'cartao_credito':
            return formatCardNumber(value);
        default:
            return value;
    }
};


export default function GenericField({ field, onValueChange }: GenericFieldProps) {
    const { register, setValue, watch } = useFormContext();
    const fieldValue = watch(field.campoApi || '');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const maskedValue = applyMask(value, field.mask);
        
        if (field.campoApi) {
            setValue(field.campoApi, maskedValue);
            onValueChange?.(maskedValue);
        }
    };

    const renderField = () => {
        switch (field.type) {
            case 'text':
                return (
                    <Input
                        id={field.campoApi}
                        type="text"
                        placeholder={field.placeholder}
                        maxLength={field.tamanho ? parseInt(field.tamanho) : undefined}
                        {...register(field.campoApi || '')}
                        onChange={handleInputChange}
                        className="w-full"
                    />
                );
            
            case 'select': {
                let optionsList: TpOptions[] = [];
                if (typeof field.options === 'string') {
                    optionsList = formatOptions(field.options);
                } else if (Array.isArray(field.options)) {
                    optionsList = field.options.map((opt: any) => {
                        if (typeof opt === 'string') return { label: opt, value: opt } as TpOptions;
                        return opt as TpOptions;
                    });
                }

                return (
                    <Select
                        value={(fieldValue as string) || undefined}
                        onValueChange={(value) => {
                            if (field.campoApi) {
                                setValue(field.campoApi, value);
                                onValueChange?.(value);
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={field.placeholder || "Selecione uma opção"} />
                        </SelectTrigger>
                        <SelectContent>
                            {optionsList.map((option, index) => (
                                <SelectItem key={index} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            }
            
            default:
                return (
                    <Input
                        id={field.campoApi}
                        type="text"
                        placeholder={field.placeholder}
                        {...register(field.campoApi || '')}
                        onChange={handleInputChange}
                        className="w-full"
                        maxLength={field.tamanho ? parseInt(field.tamanho) : undefined}
                    />
                );
        }
    };

    return (
        <div className="space-y-2 col-span-1 w-full">
            {field.campoApi && (
                <Label htmlFor={field.campoApi}>
                    {field.nome}
                    {field.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                </Label>
            )}
            {renderField()}
        </div>
    );
}