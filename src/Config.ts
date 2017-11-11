import * as purl from 'purl';
import { Config, ReadableObject, Settings } from './Types';
import { buildAjaxRequest, error, file_exists, getExtension, handleAjaxResponseErrors } from './Utils';
import { buildLangFileUrl, getLang, init, setLang, setTranslations } from './LangModel';

/**
 * Plugin's default options
 */

const defaults: Settings = {
  baseUrl: '.',	// relative path to the FM plugin folder
  // config: <Config>{},		// configuration options
  callbacks: {
    beforeCreateImageUrl: (_resourceObject: ReadableObject, url: string): string => url,
    beforeCreatePreviewUrl: (_resourceObject: ReadableObject, url: string): string => url,
    beforeSelectItem: (_resourceObject: ReadableObject, url: string): string => url,
    afterSelectItem: (/*resourceObject, url, contextWindow*/) => {
    }
  }
};

export let apiConnector: string;
export let config: Config;
export let _url_: purl.Url = purl();
export let settings: Settings;

function loadConfigFile(type: string) {
  let url: string;

  type = (typeof type === 'undefined') ? 'user' : type;

  if(type === 'user') {
    if(_url_.param('config'))
      url = `${settings.baseUrl}/config/${_url_.param('config')}`;
    else
      url = `${settings.baseUrl}/config/filemanager.config.json`;

  } else
    url = `${settings.baseUrl}/config/filemanager.config.default.json`;

  return $.ajax({
    type: 'GET',
    url: url,
    dataType: 'json',
    cache: false,
    error: () => {
      error(`Given config file (${url}) does not exist!`);
    }
  });
}

export function configure(pluginOptions?: any) {
  settings = $.extend(true, defaults, pluginOptions);

  return $.when(loadConfigFile('default'), loadConfigFile('user'))
    .done((confd, confu) => {
      let config_default = confd[ 0 ];
      let config_user = confu[ 0 ];

      // remove version from user config file
      if(config_user !== undefined && config_user !== null)
        delete config_user.version;

      // merge default config and user config file
      config = $.extend({}, config_default, config_user);

      // setup apiConnector
      if(config.api.connectorUrl)
        apiConnector = <string>config.api.connectorUrl;
      else {
        let connectorUrl = location.origin + location.pathname;
        let langConnector = `connectors/${config.api.lang}/filemanager.${config.api.lang}`;

        // for url like http://site.com/index.html
        if(getExtension(connectorUrl).length > 0)
          connectorUrl = connectorUrl.substring(0, connectorUrl.lastIndexOf('/') + 1);

        apiConnector = connectorUrl + langConnector;
      }
    });
}

export function localize() {

  init(settings.baseUrl);

  return $.ajax()
    .then((): any => {
      let urlLangCode = _url_.param('langCode');

      if(urlLangCode) {
        // try to load lang file based on langCode in query params
        return file_exists(buildLangFileUrl(urlLangCode))
          .done(() => {
            setLang(urlLangCode);
          })
          .fail(() => {
            setTimeout(function() {
              error(`Given language file (${buildLangFileUrl(urlLangCode)}) does not exist!`);
            }, 500);
          });
      } else
        setLang(config.language.default);
    })
    .then(() => {
      return $.ajax({
        type: 'GET',
        url: buildLangFileUrl(getLang()),
        dataType: 'json'
      }).done(function(jsonTrans) {
        setTranslations(jsonTrans);
      });
    });
}

export function performInitialRequest() {
  return buildAjaxRequest('GET', {
    mode: 'initiate'
  }).done((response: any) => {
    if(response.data) {
      let serverConfig = response.data.attributes.config;

      // configuration options retrieved from the server
      $.each(serverConfig, (section, options) => {
        $.each(options, (param, value) => {
          if((<any>config)[ section ] === undefined)
            (<any>config)[ section ] = [];

          (<any>config)[ section ][ param ] = value;
        });
      });

      // If the server is in read only mode, set the GUI to browseOnly:
      if(config.security.readOnly)
        config.options.browseOnly = true;

    }
    handleAjaxResponseErrors(response);
  }).fail(() => {
    error('Unable to perform initial request to server.');
  }).then((response: JQuery.jqXHR): any => {
    // noinspection TypeScriptUnresolvedVariable
    if((<any>response).errors) { // todo: errors does not exist in the jquery type definition
      return $.Deferred().reject();
    }
  });
}