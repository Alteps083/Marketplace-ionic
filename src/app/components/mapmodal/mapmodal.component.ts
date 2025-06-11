import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController } from '@ionic/angular';

declare var google: any;

@Component({
  selector: 'app-mapmodal',
  templateUrl: './mapmodal.component.html',
  styleUrls: ['./mapmodal.component.scss'],
})
export class MapmodalComponent implements AfterViewInit {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  @ViewChild('searchbar', { static: false }) searchbar!: ElementRef;

  map: any;
  marker: any;
  geocoder: any;
  direccionCompleta: string = '';
  calle: string = '';
  comuna: string = '';
  ciudad: string = '';

  ubicacionSeleccionada = {
    lat: null,
    lng: null
  };

  autocomplete: any;

  constructor(private modalCtrl: ModalController) { }

  async ngAfterViewInit() {
    try {
      await this.loadGoogleMaps();
      this.cargarMapa();
      this.initAutocomplete();
    } catch (error) {
      console.error('Error al cargar Google Maps:', error);
    }
  }

  loadGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).google && (window as any).google.maps) {
        resolve();
      } else {
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBLUHfynKkzKEGxZ4GeZgem9gxmCtz-iUw&libraries=places&v=weekly';
        script.async = true;
        script.defer = true;

        script.onload = () => {
          if ((window as any).google && (window as any).google.maps) {
            resolve();
          } else {
            reject('Google Maps no está disponible después de cargar el script.');
          }
        };

        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
      }
    });
  }

  cargarMapa() {
    this.geocoder = new google.maps.Geocoder();
    const latLng = new google.maps.LatLng(-33.4489, -70.6693);

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: latLng,
      zoom: 15,
      mapId: 'ec89516a11cad02adbd491ed',
    });

    this.marker = new google.maps.Marker({
      position: latLng,
      map: this.map,
      draggable: true,
    });

    this.ubicacionSeleccionada.lat = latLng.lat();
    this.ubicacionSeleccionada.lng = latLng.lng();

    this.marker.addListener('dragend', (event: any) => {
      const pos = event.latLng;
      this.ubicacionSeleccionada.lat = pos.lat();
      this.ubicacionSeleccionada.lng = pos.lng();
      this.getAddressFromLatLng(pos.lat(), pos.lng());
    });

    this.map.addListener('click', (event: any) => {
      const clickedLatLng = event.latLng;
      this.marker.setPosition(clickedLatLng);
      this.ubicacionSeleccionada.lat = clickedLatLng.lat();
      this.ubicacionSeleccionada.lng = clickedLatLng.lng();
      this.getAddressFromLatLng(clickedLatLng.lat(), clickedLatLng.lng());
    });
  }

  getAddressFromLatLng(lat: number, lng: number) {
  const latlng = { lat, lng };

  this.geocoder.geocode({ location: latlng }, (results: any, status: any) => {
    if (status === 'OK' && results[0]) {
      this.direccionCompleta = results[0].formatted_address;

      // Reinicia los valores
      this.calle = '';
      this.ciudad = '';
      this.comuna = '';

      const components = results[0].address_components;

      components.forEach((component: any) => {
        if (component.types.includes('route')) {
          this.calle = component.long_name;
        }

        if (component.types.includes('locality')) {
          this.ciudad = component.long_name;
        }

        if (component.types.includes('administrative_area_level_2') || component.types.includes('sublocality')) {
          this.comuna = component.long_name;
        }
      });

      console.log('Calle:', this.calle);
      console.log('Ciudad:', this.ciudad);
      console.log('Comuna:', this.comuna);
    } else {
      console.error('No se pudo obtener la dirección a partir de la latitud y longitud');
    }
  });
}



  initAutocomplete() {
    this.autocomplete = new google.maps.places.Autocomplete(this.searchbar.nativeElement, {
      types: ['geocode']
    });

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        alert('No se encontró la ubicación');
        return;
      }

      const location = place.geometry.location;
      this.map.setCenter(location);
      this.marker.setPosition(location);

      this.ubicacionSeleccionada.lat = location.lat();
      this.ubicacionSeleccionada.lng = location.lng();

      this.getAddressFromLatLng(location.lat(), location.lng());
    });
  }

  confirmarUbicacion() {
    const data = {
      lat: this.ubicacionSeleccionada.lat,
      lng: this.ubicacionSeleccionada.lng,
      direccionCompleta: this.direccionCompleta,
      calle: this.calle,
      ciudad: this.ciudad,
      comuna: this.comuna
    };

    this.modalCtrl.dismiss(data);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
