# Local

```tsx
<Controller
  name="birthCountryCode"
  control={form.control}
  render={({ field, fieldState }) => (
    <GhostCombobox
      {...field}
      label="Pays de naissance"
      options={countries}
      errorMessage={fieldState.error?.message}
      isSearchable
      isClearable
      getOptionLabel={(option: any) => option.countryName}
      getOptionValue={(option: any) => option.countryCode}
      loadOptions={(inputValue: string, callback) => {
        return countries.filter((option) => {
          if (
            option.countryName.toLowerCase().includes(inputValue.toLowerCase())
          ) {
            return option;
          }

          if (
            option.countryCode.toLowerCase().includes(inputValue.toLowerCase())
          ) {
            return option;
          }

          return null;
        });
      }}
      defaultValue={() => {
        const foundItem = countries.find(
          (country) => country.countryCode === field.value
        );

        return foundItem;
      }}
      onChange={(option) => {
        if (option) {
          field.onChange(option.countryCode);
        } else {
          field.onChange("");
        }
      }}
    />
  )}
/>
```

# Remote API Query

```tsx
const queryCities = async (inputValue: string) => {
  const data = await wolfios
    .get("/api/insee/cities", {
      params: {
        city: inputValue,
      },
    })
    .then((res) => res.data);

  return data.nodes;
};

<Controller
  name="birthCity"
  control={form.control}
  render={({ field, fieldState }) => (
    <GhostCombobox
      {...field}
      label="Commune de naissance"
      errorMessage={fieldState.error?.message}
      isSearchable
      isClearable
      isLoadOptionsDebounced
      loadOptions={queryCities}
      getOptionLabel={(option) => option?.city}
      getOptionValue={(option) => option?.city}
      defaultValue={() => {
        if (field.value) {
          return { city: field.value };
        } else {
          return null;
        }
      }}
      onChange={(option) => {
        if (option) {
          field.onChange(option.city);
        } else {
          field.onChange("");
        }
      }}
    />
  )}
/>;
```
