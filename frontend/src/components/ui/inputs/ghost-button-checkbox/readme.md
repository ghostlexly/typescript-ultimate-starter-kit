```tsx
<StyleItem
    form={form}
    value={"default"}
    title={"Default"}
    imageSrc={DefaultStyleImg}
/>

<StyleItem
    form={form}
    value={"disney"}
    title={"Disney"}
    imageSrc={DefaultStyleImg}
/>


const StyleItem = ({ form, value, title, imageSrc }) => {
  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <Controller
          control={form.control}
          name="style"
          render={({ field, fieldState }) => (
            <GhostButtonCheckbox
              {...field}
              formValue={field.value}
              value={value}
            >
              <div className="relative h-44 w-32">
                <GhostImage
                  src={imageSrc}
                  alt={title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 200px, (max-width: 1200px) 500px, 900px"
                />
              </div>
            </GhostButtonCheckbox>
          )}
        />
        <div className="font-visbycfBold">{title}</div>
      </div>
    </>
  );
};
```
