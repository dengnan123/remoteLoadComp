/* eslint-disable react/prop-types */
import React, { useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useDeepCompareEffect } from 'react-use';
import UmdLoader from './components/UmdLoader';
import ErrorWrap from './components/ErrorWrap';

export default function RemoteLoadComp({
  plugins = [],
  pluginRef,
  onChange,
  propsData,
}) {
  const pluginRefHash = useRef({});
  const sendDataToParent = useCallback(
    (data) => {
      onChange && onChange(data);
      if (pluginRef) {
        pluginRef.current = data;
      }
    },
    [onChange, pluginRef]
  );

  const { pathname } = window.location;
  const renderPlugin = useCallback(
    (v, propsData = {}) => {
      const { pluginName, pluginSrc, mountDivId, pluginProps = {} } = v;
      const ele = document.getElementById(mountDivId);
      const geturl = () => {
        return pluginSrc;
      };
      const compProps = {
        pluginProps,
        sendDataToParent,
        ...propsData,
        propsData,
      };

      if (!ele) {
        return;
      }
      const cmp = (
        <ErrorWrap>
          <UmdLoader url={geturl()} name={pluginName} props={compProps}>
            <p>Loading remote component...</p>
          </UmdLoader>
        </ErrorWrap>
      );
      pluginRefHash.current[pluginName] = cmp;
      ReactDOM.render(cmp, ele);
    },
    [sendDataToParent]
  );

  useDeepCompareEffect(() => {
    plugins
      .filter((v) => pathname.includes(v.routerPath))
      .map((v) => {
        const { mountDivs } = v;
        for (const v of mountDivs) {
          renderPlugin(v, propsData);
        }
        return v;
      });
  }, [plugins, propsData, pathname, renderPlugin]);
  return null;
}
