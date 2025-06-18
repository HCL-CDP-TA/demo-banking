"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

export function FormFieldRenderer({ field, value, onChange, error, t }: any) {
  switch (field.type) {
    case "text":
      return (
        <Input
          id={field.id}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholderKey ? t(field.placeholderKey) : ""}
          className={error ? "border-red-500" : ""}
        />
      )
    case "number":
      return (
        <Input
          id={field.id}
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholderKey ? t(field.placeholderKey) : ""}
          className={error ? "border-red-500" : ""}
        />
      )
    case "select":
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={error ? "border-red-500" : ""}>
            <SelectValue placeholder={t(field.placeholderKey)} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option: any) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case "textarea":
      return (
        <Textarea
          id={field.id}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholderKey ? t(field.placeholderKey) : ""}
          rows={field.rows || 4}
        />
      )
    case "checkbox":
      return (
        <Checkbox id={field.id} checked={value} onCheckedChange={onChange} className={error ? "border-red-500" : ""} />
      )
    case "date":
      return (
        <Input
          id={field.id}
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={error ? "border-red-500" : ""}
        />
      )
    default:
      return (
        <Input
          id={field.id}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={error ? "border-red-500" : ""}
        />
      )
  }
}
