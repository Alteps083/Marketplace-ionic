import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Usuario } from 'src/app/services/usuario';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { NotificationsPushService } from 'src/app/services/notifications-push.service';
import { Notificacion } from 'src/app/services/notificacion';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { MapmodalComponent } from 'src/app/components/mapmodal/mapmodal.component';

declare var google: any;

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
})

export class AgregarPage implements OnInit {

  ubicacionMetodo: string = '';
  latitud: number | null = null;
  longitud: number | null = null;
  direccionCompleta: string = '';
  calle: string = '';
  ciudad: string = '';
  comuna: string = '';
  mostrarMapa: boolean = false;
  map: any;
  marker: any;

  imagePreviews: string[] = [];
  miFormulario: FormGroup;
  marginBottom: string = '200px';
  profileImage: string | null = null;
  usuario: Usuario | null = null;
  categorias: any[] = [];

  constructor(
    private router: Router,
    private bd: ServicebdService,
    private storage: NativeStorage,
    private fb: FormBuilder,
    private http: HttpClient,
    private notificationService: NotificationsPushService,
    private modalCtrl: ModalController
  ) {
    this.miFormulario = this.fb.group({
      titulo: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],
      estado: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(50)]],
      ubicacionMetodo: ['', Validators.required]
    });
  }

  async ionViewWillEnter() {
    await this.cargarCategorias();
    await this.cargarUsuario();
  }

  onDescriptionChange(event: any) {
    const input = event.target.value;
    this.miFormulario.controls['descripcion'].setValue(input);
  }

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete();
      }
    })
  }

  async cargarUsuario() {
    this.storage.getItem('usuario').then(async (data: Usuario) => {
      if (data) {
        this.usuario = data;
        try {
          this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario?.id || 0);
        } catch (error) {
          console.log('Error al cargar la imagen de perfil:', error);
        }
      }
    }).catch(error => {
      console.log('Error al recuperar usuario: ', JSON.stringify(error));
    });
  }

  async onSubmit() {
    if (this.miFormulario.valid) {
      const producto = this.miFormulario.value;
      const imagenes = this.imagePreviews;

      if (this.usuario) {
        const id_vendedor = this.usuario.id;
        const direccionCompleta = `${this.calle}, ${this.ciudad}, ${this.comuna}`;

        const id_producto = await this.bd.agregarProducto(
          id_vendedor,
          producto.titulo,
          producto.descripcion,
          producto.categoria,
          producto.estado,
          producto.precio,
          imagenes,
          direccionCompleta
        );

        const notificacion: Notificacion = {
          id: id_producto!,
          imagen: this.usuario.imagen,
          nombreUsuario: this.usuario.nombre,
          nombreProducto: producto.titulo,
          fecha: new Date().toISOString()
        };

        await this.notificationService.addNotification(notificacion);
        this.router.navigate(['tabs/home']);
        console.log('Datos del producto: ', producto);
        this.miFormulario.reset();
        this.imagePreviews = [];
      } else {
        console.log('No se pudo obtener el id del vendedor');
        this.router.navigate(['/login']);
      }
    }
  }

  async ngOnInit() {

    await this.cargarCategorias();
    await this.cargarUsuario();

    if (this.descripcion) {
      this.descripcion.markAsTouched();
    }

    Keyboard.addListener('keyboardWillShow', (info) => {
      this.marginBottom = `${info.keyboardHeight}px`;
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.marginBottom = '0px';
    });
  }

  async cargarCategorias() {
    this.categorias = await this.bd.obtenerCategorias();
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    if (image && image.base64String) {
      this.imagePreviews.push(`data:image/jpeg;base64,${image.base64String}`);
    }
  }

  async selectFromGallery() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    });

    if (image && image.base64String) {
      this.imagePreviews.push(`data:image/jpeg;base64,${image.base64String}`);
    }
  }

  get descripcion() {
    return this.miFormulario.get('descripcion');
  }

  async obtenerUbicacionAuto() {
    try {
      const permission: PermissionStatus = await Geolocation.requestPermissions();

      if (permission.location === 'granted') {
        const position = await Geolocation.getCurrentPosition();
        this.latitud = position.coords.latitude;
        this.longitud = position.coords.longitude;

        console.log('Ubicación automática:', this.latitud, this.longitud);

        this.geocodificar(this.latitud, this.longitud);

        this.mostrarMapa = false;
      } else {
        alert('Permiso para acceder a la ubicación denegado.');
      }
    } catch (error) {
      console.error('Error al obtener ubicación automática:', error);
      alert('No se pudo obtener la ubicación automática.');
    }
  }

  geocodificar(lat: number, lng: number) {
    const apiKey = 'AIzaSyBLUHfynKkzKEGxZ4GeZgem9gxmCtz-iUw';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    this.http.get<any>(url).subscribe((respuesta) => {
      const resultados = respuesta.results;
      if (resultados.length > 0) {
        const direccion = resultados[0].address_components;
        const comuna = direccion.find((d: any) =>
          d.types.includes('locality') || d.types.includes('sublocality')
        );
        this.ciudad = comuna ? comuna.long_name : 'No encontrada';
        console.log('Ciudad/Comuna:', this.ciudad);
      }
    });
  }

  cargarMapa() {
    const center = {
      lat: this.latitud || -33.45,
      lng: this.longitud || -70.6667
    };
    this.map = new google.maps.Map(document.getElementById('map'), {
      center,
      zoom: 14,
    });

    this.map.addListener('click', (e: any) => {
      this.colocarMarcador(e.latLng);
    });
  }

  async abrirMapaManual() {
    const modal = await this.modalCtrl.create({
      component: MapmodalComponent,
      cssClass: 'fullscreen-modal',
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data) {
      this.latitud = data.lat;
      this.longitud = data.lng;
      this.direccionCompleta = data.direccionCompleta || '';
      this.calle = data.calle || '';
      this.comuna = data.comuna || '';
      this.ciudad = data.ciudad || '';

      console.log('Ubicación seleccionada:', this.direccionCompleta, this.calle, this.ciudad);
    }
  }


  async onCambiarUbicacionManual() {
    this.ubicacionMetodo = 'manual';
    this.mostrarMapa = true;

    try {
      const permission: PermissionStatus = await Geolocation.requestPermissions();
      if (permission.location === 'granted') {
        const position = await Geolocation.getCurrentPosition();
        this.latitud = position.coords.latitude;
        this.longitud = position.coords.longitude;
      }
    } catch (err) {
      console.warn('No se pudo obtener ubicación, usando centro por defecto');
      this.latitud = -33.45;
      this.longitud = -70.6667;
    }

    setTimeout(() => {
      if (typeof google !== 'undefined') {
        this.cargarMapa();
      } else {
        this.cargarScriptGoogleMaps();
      }
    }, 100);
  }

  cambiarMetodo(metodo: string) {
    this.ubicacionMetodo = metodo;

    if (metodo === 'auto') {
      this.mostrarMapa = false;
    } else if (metodo === 'manual') {
      this.mostrarMapa = false;
    }
  }

  colocarMarcador(latLng: any) {
    if (this.marker) {
      this.marker.setMap(null);
    }
    this.marker = new google.maps.Marker({
      position: latLng,
      map: this.map,
    });

    this.latitud = latLng.lat();
    this.longitud = latLng.lng();
  }

  cargarScriptGoogleMaps() {
    if (!document.querySelector('#google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBLUHfynKkzKEGxZ4GeZgem9gxmCtz-iUw';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.cargarMapa();
      };
      document.body.appendChild(script);
    } else {
      this.cargarMapa();
    }
  }

  perfil() {
    this.router.navigate(['tabs/perfil']);
  }

  homead() {
    this.router.navigate(['/tabs/homeadmin']);
  }
}
