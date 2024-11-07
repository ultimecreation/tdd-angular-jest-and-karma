import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing'
import { routes } from './router/app-router.module';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HomeComponent } from './home/home.component';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from './shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { ActivateComponent } from './activate/activate.component';
import { UserComponent } from './user/user.component';

let appComponent: HTMLElement

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let router: Router
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                SignUpComponent,
                HomeComponent,
                LoginComponent,
                ActivateComponent,
                UserComponent
            ],
            imports: [RouterTestingModule.withRoutes(routes), HttpClientTestingModule, SharedModule, ReactiveFormsModule]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router)
        fixture.detectChanges();
        appComponent = fixture.nativeElement
    });

    describe('Routing', () => {

        const testCases = [
            { path: '/', pageId: 'home-page' },
            { path: '/signup', pageId: 'signup-page' },
            { path: '/login', pageId: 'login-page' },
            { path: '/user/1', pageId: 'user-page' },
            { path: '/activate/1', pageId: 'activation-page' },
        ]
        testCases.forEach(({ path, pageId }) => {
            it(`displays ${pageId} at ${path}`, async () => {
                await router.navigate([path])
                fixture.detectChanges()
                const page = appComponent.querySelector(`[data-testid="${pageId}"]`)
                expect(page).toBeTruthy()
            })

        })
        const linkCases = [
            { path: '/', title: 'Home' },
            { path: '/signup', title: 'Signup' },
            { path: '/login', title: 'Login' },
        ]

        linkCases.forEach(({ path, title }) => {
            it(`should display link with title  ${title} for path "${path}"`, () => {
                const linkElement = appComponent.querySelector(`a[title="${title}"]`) as HTMLAnchorElement
                expect(linkElement.pathname).toEqual(path)
            })
        })

        const navigationCases = [
            { initialPath: '/', clickingTo: 'Signup', visiblePage: 'signup-page' },
            { initialPath: '/signup', clickingTo: 'Home', visiblePage: 'home-page' },
            { initialPath: '/', clickingTo: 'Login', visiblePage: 'login-page' },
        ]

        navigationCases.forEach(({ initialPath, clickingTo, visiblePage }) => {
            it(`displays ${visiblePage} after clicking To ${clickingTo}`, fakeAsync(async () => {
                await router.navigate([initialPath])
                const linkElement = appComponent.querySelector(`a[title="${clickingTo}"]`) as HTMLAnchorElement
                linkElement.click()
                tick()
                fixture.detectChanges()
                const page = appComponent.querySelector(`[data-testid="${visiblePage}"]`)
                expect(page).toBeTruthy()
            }))
        })
    })

});
