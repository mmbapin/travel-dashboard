import { Header } from 'components'
import React, { useState } from 'react'
import type { Route } from './+types/dashboard';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { comboBoxItems, selectItems } from '~/constants';
import { cn, formatKey } from '~/lib/utils';
import { LayerDirective, LayersDirective, MapsComponent } from '@syncfusion/ej2-react-maps';
import { world_map } from '~/constants/world_map';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { account } from '~/appwrite/client';

export const loader = async (): Promise<Country[]> => {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,latlng,flags,maps');
    const data = await response.json();
    // console.log('data', data);
    return data.map((country: any) => ({
        name: country.name?.common,
        flagUrl: country.flags?.svg,
        coordinates: country.latlng,
        value: country.name?.common,
        openStreetMap: country.maps?.openStreetMaps
    }));
};

const itemTemplate = (props: any) => {
    return (
        <div className="flex items-center gap-2 p-1">
            <img src={props.flagUrl} alt={props.text} className="w-6 h-4 object-cover"/>
            <span className="text-sm">{props.text}</span>
        </div>
    );
};



const CreateTrip = ({loaderData}: Route.ComponentProps) => {
    const countries = loaderData as Country[] | undefined;
    const [formData, setFormData] = useState<TripFormData>(() => ({
        country: countries && countries.length > 0 ? countries[0].name : '',
        duration: 0,
        travelStyle: '',
        interest: '',
        budget: '',
        groupType: ''
    }));
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        setLoading(true);
        
        if(!formData.country || !formData.duration || !formData.travelStyle || !formData.interest || !formData.budget || !formData.groupType) {
            setError('Please fill in all fields.');
            setLoading(false);
            return;
        }

        if(formData.duration < 1 || formData.duration > 10) {
            setError('Duration must be between 1 and 10 days.');
            setLoading(false);
            return;
        }

        const user = await account.get();
        if(!user.$id){
            setError('You must be logged in to create a trip.');
            setLoading(false);
            return;
        }

        try {
            console.log("User", user);
            console.log("formData", formData);
        } catch (error) {
            console.error('Error generating trip', error);
        }finally{
            setLoading(false);
            setError(null);
        }
    };

    const handleChange = (key: keyof TripFormData, value: string | number) => {
        setFormData({...formData, [key]: value });
    }
    

    const countryData = countries?.map((country: Country) => ({
        text: country.name,
        value: country.value,
        flagUrl: country.flagUrl,
    })) || [];

    const mapData = [
        {
            country: formData.country,
            color: '#EA382E',
            coordinates: countries?.find((c: Country) => c.name === formData.country)?.coordinates || []
        }
    ]

    return (
        <main className='flex flex-col gap-10 pb-20 wrapper'>
            <Header 
                title="Add a New Trip"
                description="View and edit AI-generated travel plans."
            />

            <section className='mt-2.5 wrapper-md'>
                <form className='trip-form' onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="country">
                            Country
                        </label>

                        <ComboBoxComponent
                            id="country"
                            dataSource={countryData}
                            fields={{ text: 'text', value: 'value' }}
                            placeholder="Select a country"
                            className='combo-box'
                            itemTemplate={itemTemplate}
                            change={(e: {value: string | undefined}) => {
                                if (e.value) {
                                    handleChange('country', e.value);
                                }
                            }}
                            allowFiltering
                            filtering={(e: any) => {
                                const query = e.text.trim().toLowerCase();
                                e.updateData(countries?.filter((country) => country.name.toLowerCase().includes(query)).map((country) => ({
                                    text: country.name,
                                    value: country.value,
                                    flagUrl: country.flagUrl,
                                })));
                            }}
                        ></ComboBoxComponent>
                    </div>

                    <div>
                        <label htmlFor='duration'>
                            Duration
                        </label>
                        <input 
                            id='duration'
                            name='duration'
                            type='number'
                            onChange={(e) => handleChange('duration', Number(e.target.value))}
                            placeholder='Enter a number of days'
                            className='form-input placeholder:text-gray-500'
                        />
                    </div>

                    {selectItems.map((key) => (
                        <div key={key}>
                            <label htmlFor={key}>
                                {formatKey(key)}
                            </label>
                            <ComboBoxComponent 
                                id={key}
                                className='combo-box'
                                dataSource={comboBoxItems[key].map((item) => ({
                                    text: item,
                                    value: item,
                                }))}
                                fields={{ text: 'text', value: 'value' }}
                                placeholder={`Select a ${formatKey(key)}`}
                                change={(e: {value: string | undefined}) => {
                                    if (e.value) {
                                        handleChange(key, e.value);
                                    }
                                }}
                                allowFiltering
                                filtering={(e: any) => {
                                    const query = e.text.trim().toLowerCase();
                                    e.updateData(comboBoxItems[key]?.filter((item) => item.toLowerCase().includes(query)).map((item) => ({
                                        text: item,
                                        value: item,
                                    })));
                                }}
                            />
                        </div>
                    ))}

                    <div>
                        <label htmlFor="location">
                            Location on the world map
                        </label>
                        <MapsComponent>
                            <LayersDirective>
                                <LayerDirective
                                    shapeData={world_map}
                                    dataSource={mapData}
                                    shapePropertyPath="name"
                                    shapeDataPath="country"
                                    shapeSettings={{ colorValuePath: "color", fill: "#E5E5E5" }}
                                />
                            </LayersDirective>
                        </MapsComponent>
                    </div>

                    <div className='bg-gray-200 h-px w-full'/>

                    {error && <div className='error'>{error}</div>}

                    <footer className='px-6 w-full'>
                        <ButtonComponent type='submit' className='button-class !h-12 !w-full' disabled={loading}>
                            <img src={`/assets/icons/${loading ? 'loader.svg' : 'magic-star.svg'}`} alt="icon" className={cn('size-5', { 'animate-spin': loading })}/>
                            <span className='p-16-semibold text-white'>
                                {loading ? 'Generating...' : 'Generate Trip'}
                            </span>
                        </ButtonComponent>
                    </footer>
                </form>
            </section>
        </main>
    )
}

export default CreateTrip